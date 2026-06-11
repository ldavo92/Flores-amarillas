"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { encryptField, hashField, normalizePhone } from "@/lib/crypto";
import type { EstatusOrden } from "@/types/database";

async function getTallerId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("taller_id")
    .eq("id", user.id)
    .single();

  if (!perfil?.taller_id) throw new Error("El usuario no pertenece a ningún taller");
  return { supabase, tallerId: perfil.taller_id };
}

export async function actualizarEstatusOrden(ordenId: string, nuevoEstatus: EstatusOrden) {
  const { supabase } = await getTallerId();

  const { error } = await supabase
    .from("ordenes_trabajo")
    .update({ estatus: nuevoEstatus })
    .eq("id", ordenId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}

export interface CrearOrdenState {
  error?: string;
}

export async function crearOrden(_prevState: CrearOrdenState, formData: FormData): Promise<CrearOrdenState> {
  const { supabase, tallerId } = await getTallerId();

  const nombreCliente = String(formData.get("nombreCliente") || "").trim();
  const telefono = normalizePhone(String(formData.get("telefono") || "").trim());
  const marca = String(formData.get("marca") || "").trim();
  const modelo = String(formData.get("modelo") || "").trim();
  const anioRaw = String(formData.get("anio") || "").trim();
  const placas = String(formData.get("placas") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim();

  if (!nombreCliente || !telefono || !marca || !modelo || !descripcion) {
    return { error: "Completa los campos obligatorios." };
  }

  const telefonoHash = hashField(telefono);
  const telefonoEnc = encryptField(telefono);

  // Buscar cliente existente por teléfono o crear uno nuevo
  const { data: clienteExistente } = await supabase
    .from("clientes")
    .select("id")
    .eq("taller_id", tallerId)
    .eq("telefono_hash", telefonoHash)
    .maybeSingle();

  let clienteId = clienteExistente?.id as string | undefined;

  if (!clienteId) {
    const { data: nuevoCliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        taller_id: tallerId,
        nombre: nombreCliente,
        telefono_enc: telefonoEnc,
        telefono_hash: telefonoHash,
        acepto_aviso_privacidad: true,
        aviso_privacidad_fecha: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (clienteError || !nuevoCliente) {
      return { error: `No se pudo crear el cliente: ${clienteError?.message}` };
    }
    clienteId = nuevoCliente.id;
  }

  const { data: vehiculo, error: vehiculoError } = await supabase
    .from("vehiculos")
    .insert({
      taller_id: tallerId,
      cliente_id: clienteId,
      marca,
      modelo,
      anio: anioRaw ? Number(anioRaw) : null,
      placas_enc: placas ? encryptField(placas) : null,
    })
    .select("id")
    .single();

  if (vehiculoError || !vehiculo) {
    return { error: `No se pudo registrar el vehículo: ${vehiculoError?.message}` };
  }

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes_trabajo")
    .insert({
      taller_id: tallerId,
      vehiculo_id: vehiculo.id,
      cliente_id: clienteId,
      estatus: "recepcion",
      descripcion_cliente: descripcion,
    })
    .select("id")
    .single();

  if (ordenError || !orden) {
    return { error: `No se pudo crear la orden: ${ordenError?.message}` };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/ordenes/${orden.id}`);
}
