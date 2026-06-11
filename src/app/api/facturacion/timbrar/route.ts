import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { construirPayloadCfdi, timbrarCfdi, urlsCfdi, type FacturaItemInput } from "@/lib/facturama";
import { CLAVES_PRODUCTO_SERVICIO } from "@/lib/sat-catalog";

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const ordenId = String(body.ordenId || "");
  if (!ordenId) {
    return NextResponse.json({ error: "Falta 'ordenId'" }, { status: 400 });
  }

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes_trabajo")
    .select(
      "id, taller_id, talleres ( nombre, rfc, regimen_fiscal, codigo_postal ), clientes ( nombre, rfc_facturacion, uso_cfdi, regimen_fiscal_receptor, codigo_postal, email ), cotizaciones ( id, mano_obra, refacciones, subtotal, iva, total, estatus_aprobacion )"
    )
    .eq("id", ordenId)
    .single();

  if (ordenError || !orden) {
    return NextResponse.json({ error: ordenError?.message || "Orden no encontrada" }, { status: 404 });
  }

  const taller = Array.isArray(orden.talleres) ? orden.talleres[0] : orden.talleres;
  const cliente = Array.isArray(orden.clientes) ? orden.clientes[0] : orden.clientes;
  const cotizaciones = orden.cotizaciones ?? [];
  const cotizacion = cotizaciones[cotizaciones.length - 1];

  if (!taller?.rfc || !taller.regimen_fiscal || !taller.codigo_postal) {
    return NextResponse.json(
      { error: "El taller no tiene configurados RFC, régimen fiscal o código postal." },
      { status: 400 }
    );
  }

  if (!cliente?.rfc_facturacion || !cliente.regimen_fiscal_receptor || !cliente.codigo_postal) {
    return NextResponse.json(
      { error: "El cliente no tiene RFC, régimen fiscal o código postal para facturación." },
      { status: 400 }
    );
  }

  if (!cotizacion) {
    return NextResponse.json({ error: "La orden no tiene una cotización registrada." }, { status: 400 });
  }

  const items: FacturaItemInput[] = [];

  if (cotizacion.mano_obra > 0) {
    items.push({
      descripcion: "Mano de Obra - servicio de taller mecánico",
      cantidad: 1,
      precioUnitario: cotizacion.mano_obra,
      claveProdServ: CLAVES_PRODUCTO_SERVICIO.REPARACION_MANTENIMIENTO,
    });
  }

  const refacciones = (cotizacion.refacciones ?? []) as { nombre: string; precio: number; cantidad: number }[];
  for (const refaccion of refacciones) {
    items.push({
      descripcion: `Refacción - ${refaccion.nombre}`,
      cantidad: refaccion.cantidad,
      precioUnitario: refaccion.precio,
      claveProdServ: CLAVES_PRODUCTO_SERVICIO.REPARACION_MANTENIMIENTO,
    });
  }

  if (items.length === 0) {
    return NextResponse.json({ error: "La cotización no tiene conceptos para facturar." }, { status: 400 });
  }

  const payload = construirPayloadCfdi(
    {
      rfc: taller.rfc,
      nombre: taller.nombre,
      regimenFiscal: taller.regimen_fiscal,
      codigoPostal: taller.codigo_postal,
    },
    {
      rfc: cliente.rfc_facturacion,
      nombre: cliente.nombre || "PUBLICO EN GENERAL",
      usoCfdi: cliente.uso_cfdi || undefined,
      regimenFiscalReceptor: cliente.regimen_fiscal_receptor,
      codigoPostal: cliente.codigo_postal,
      email: cliente.email || undefined,
    },
    items
  );

  try {
    const resultado = await timbrarCfdi(payload);
    const urls = urlsCfdi(resultado.Id);

    const { data: factura, error: facturaError } = await supabase
      .from("facturas")
      .insert({
        orden_id: ordenId,
        facturama_id: resultado.Id,
        uuid_fiscal: resultado.Complement?.TaxStamp?.Uuid || null,
        serie: resultado.Serie || null,
        folio: resultado.Folio || null,
        total: cotizacion.total,
        xml_url: urls.xml,
        pdf_url: urls.pdf,
        estatus: "timbrada",
      })
      .select()
      .single();

    if (facturaError) {
      return NextResponse.json({ error: facturaError.message }, { status: 500 });
    }

    return NextResponse.json({ factura });
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido al timbrar";

    await supabase.from("facturas").insert({
      orden_id: ordenId,
      total: cotizacion.total,
      estatus: "error",
    });

    return NextResponse.json({ error: mensaje }, { status: 502 });
  }
}
