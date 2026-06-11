import { NextResponse } from "next/server";
import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptField, hashField, normalizePhone } from "@/lib/crypto";
import { descargarMediaTwilio, validarFirmaTwilio } from "@/lib/twilio";
import { ejecutarBotRecepcionista, transcribirAudio, analizarImagenVehiculo } from "@/lib/openai";

const { MessagingResponse } = twilio.twiml;

function twimlResponse(mensaje: string) {
  const twiml = new MessagingResponse();
  twiml.message(mensaje);
  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  // Validar que la petición venga de Twilio (omite si no hay auth token configurado, p. ej. en local con ngrok)
  const signature = request.headers.get("x-twilio-signature");
  if (process.env.TWILIO_AUTH_TOKEN && process.env.NODE_ENV === "production") {
    const valido = validarFirmaTwilio(signature, request.url, params);
    if (!valido) {
      return NextResponse.json({ error: "Firma de Twilio inválida" }, { status: 403 });
    }
  }

  const from = normalizePhone(params.From || "");
  const to = normalizePhone(params.To || "");
  const body = (params.Body || "").trim();
  const numMedia = Number(params.NumMedia || "0");

  if (!from || !to) {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: taller } = await supabase
    .from("talleres")
    .select("id, nombre, configuracion_ia, aviso_privacidad_url")
    .eq("telefono_whatsapp", to)
    .maybeSingle();

  if (!taller) {
    return twimlResponse("Este número no está configurado en TallerSaaS. Contacta al administrador.");
  }

  const telefonoHash = hashField(from);

  let { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre, acepto_aviso_privacidad")
    .eq("taller_id", taller.id)
    .eq("telefono_hash", telefonoHash)
    .maybeSingle();

  // ---------------------------------------------------------------
  // LFPDPPP: aviso de privacidad obligatorio antes de registrar datos
  // ---------------------------------------------------------------
  if (!cliente) {
    const { data: nuevoCliente } = await supabase
      .from("clientes")
      .insert({
        taller_id: taller.id,
        telefono_enc: encryptField(from),
        telefono_hash: telefonoHash,
        acepto_aviso_privacidad: false,
      })
      .select("id, nombre, acepto_aviso_privacidad")
      .single();

    cliente = nuevoCliente ?? null;

    const avisoUrl = taller.aviso_privacidad_url || process.env.PRIVACY_NOTICE_URL || "(enlace no configurado)";
    return twimlResponse(
      `¡Hola! Soy el asistente virtual de ${taller.nombre}. ` +
        `Antes de continuar, consulta nuestro Aviso de Privacidad: ${avisoUrl}\n\n` +
        `Responde *"Acepto"* para continuar y registrar tu solicitud.`
    );
  }

  if (!cliente.acepto_aviso_privacidad) {
    if (body.toLowerCase().includes("acepto")) {
      await supabase
        .from("clientes")
        .update({ acepto_aviso_privacidad: true, aviso_privacidad_fecha: new Date().toISOString() })
        .eq("id", cliente.id);

      return twimlResponse(
        `¡Gracias! Cuéntame: ¿cuál es tu nombre, qué auto tienes (marca y modelo) y qué problema presenta?`
      );
    }

    const avisoUrl = taller.aviso_privacidad_url || process.env.PRIVACY_NOTICE_URL || "(enlace no configurado)";
    return twimlResponse(
      `Para continuar necesitamos tu aceptación del Aviso de Privacidad: ${avisoUrl}\n\nResponde *"Acepto"* para continuar.`
    );
  }

  // ---------------------------------------------------------------
  // Procesar contenido multimedia (foto o nota de voz)
  // ---------------------------------------------------------------
  let contenidoExtra = "";
  let mediaUrlGuardada: string | null = null;

  if (numMedia > 0) {
    const mediaUrl = params.MediaUrl0;
    const mediaType = params.MediaContentType0 || "";
    mediaUrlGuardada = mediaUrl;

    try {
      const { buffer, contentType } = await descargarMediaTwilio(mediaUrl);

      if (mediaType.startsWith("audio")) {
        const transcripcion = await transcribirAudio(buffer, "nota-voz.ogg");
        contenidoExtra = `\n[Transcripción de nota de voz]: ${transcripcion}`;
      } else if (mediaType.startsWith("image")) {
        const base64 = buffer.toString("base64");
        const analisis = await analizarImagenVehiculo(base64, contentType, body);
        contenidoExtra = `\n[Descripción de la imagen enviada]: ${analisis}`;
      }
    } catch {
      contenidoExtra = "\n[No se pudo procesar el archivo multimedia adjunto]";
    }
  }

  // ---------------------------------------------------------------
  // Guardar mensaje entrante
  // ---------------------------------------------------------------
  await supabase.from("whatsapp_mensajes").insert({
    taller_id: taller.id,
    cliente_id: cliente.id,
    direction: "inbound",
    body: body || null,
    media_url: mediaUrlGuardada,
    twilio_sid: params.MessageSid || null,
  });

  // ---------------------------------------------------------------
  // Construir historial reciente para el bot recepcionista
  // ---------------------------------------------------------------
  const { data: mensajesPrevios } = await supabase
    .from("whatsapp_mensajes")
    .select("direction, body")
    .eq("cliente_id", cliente.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const historial = (mensajesPrevios ?? [])
    .reverse()
    .filter((m) => m.body)
    .map((m) => ({
      role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
      content: m.body as string,
    }));

  // Reemplazar/añadir el mensaje actual con el contenido extra (transcripción/imagen)
  if (contenidoExtra) {
    historial.push({ role: "user", content: `${body}${contenidoExtra}` });
  }

  const extraccion = await ejecutarBotRecepcionista(historial);

  // ---------------------------------------------------------------
  // Actualizar datos del cliente y crear orden de trabajo si procede
  // ---------------------------------------------------------------
  if (extraccion.nombre_cliente && !cliente.nombre) {
    await supabase.from("clientes").update({ nombre: extraccion.nombre_cliente }).eq("id", cliente.id);
  }

  if (extraccion.listo_para_crear_orden) {
    const { data: ordenExistente } = await supabase
      .from("ordenes_trabajo")
      .select("id")
      .eq("cliente_id", cliente.id)
      .neq("estatus", "entregado")
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (!ordenExistente) {
      const { data: vehiculo } = await supabase
        .from("vehiculos")
        .insert({
          taller_id: taller.id,
          cliente_id: cliente.id,
          marca: extraccion.marca,
          modelo: extraccion.modelo,
          anio: extraccion.anio,
        })
        .select("id")
        .single();

      if (vehiculo) {
        const { data: nuevaOrden } = await supabase
          .from("ordenes_trabajo")
          .insert({
            taller_id: taller.id,
            vehiculo_id: vehiculo.id,
            cliente_id: cliente.id,
            estatus: "recepcion",
            descripcion_cliente: extraccion.sintoma_normalizado || extraccion.sintoma,
          })
          .select("id")
          .single();

        if (nuevaOrden) {
          await supabase.from("diagnosticos_ia").insert({
            orden_id: nuevaOrden.id,
            transcripcion_audio: contenidoExtra || null,
            analisis_rag: null,
            sugerencia_piezas: [],
          });
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // Guardar mensaje saliente y responder
  // ---------------------------------------------------------------
  await supabase.from("whatsapp_mensajes").insert({
    taller_id: taller.id,
    cliente_id: cliente.id,
    direction: "outbound",
    body: extraccion.respuesta_para_cliente,
  });

  return twimlResponse(extraccion.respuesta_para_cliente);
}
