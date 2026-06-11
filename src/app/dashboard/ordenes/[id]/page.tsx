import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decryptFieldSafe } from "@/lib/crypto";
import { EstatusSelector } from "./estatus-selector";
import { RagCopiloto } from "./rag-copiloto";
import { CotizacionPanel } from "./cotizacion-form";
import { FacturaSection } from "./factura-section";

export default async function OrdenDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: orden } = await supabase
    .from("ordenes_trabajo")
    .select(
      `id, estatus, descripcion_cliente, created_at,
       vehiculos ( marca, modelo, anio, vin, placas_enc, kilometraje ),
       clientes ( nombre, telefono_enc, email, rfc_facturacion ),
       diagnosticos_ia ( id, transcripcion_audio, analisis_rag, sugerencia_piezas, created_at ),
       cotizaciones ( id, mano_obra, refacciones, subtotal, iva, total, estatus_aprobacion, created_at ),
       facturas ( id, estatus, uuid_fiscal, pdf_url, xml_url, total, created_at )`
    )
    .eq("id", params.id)
    .single();

  if (!orden) notFound();

  const vehiculo = Array.isArray(orden.vehiculos) ? orden.vehiculos[0] : orden.vehiculos;
  const cliente = Array.isArray(orden.clientes) ? orden.clientes[0] : orden.clientes;
  const diagnosticos = orden.diagnosticos_ia ?? [];
  const cotizaciones = orden.cotizaciones ?? [];
  const facturas = orden.facturas ?? [];
  const ultimaCotizacion = cotizaciones[cotizaciones.length - 1];

  const telefono = decryptFieldSafe(cliente?.telefono_enc ?? null);
  const placas = decryptFieldSafe(vehiculo?.placas_enc ?? null);

  return (
    <div className="space-y-4 pb-10">
      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-navy">
              {vehiculo?.marca} {vehiculo?.modelo} {vehiculo?.anio || ""}
            </h1>
            <p className="text-sm text-navy/60">
              {cliente?.nombre || "Cliente sin nombre"} {telefono ? `· ${telefono}` : ""}
            </p>
            {placas && <p className="text-sm text-navy/60">Placas: {placas}</p>}
            {vehiculo?.vin && <p className="text-sm text-navy/60">VIN: {vehiculo.vin}</p>}
            {vehiculo?.kilometraje && <p className="text-sm text-navy/60">KM: {vehiculo.kilometraje}</p>}
          </div>
          <EstatusSelector ordenId={orden.id} estatus={orden.estatus} />
        </div>
        {orden.descripcion_cliente && (
          <p className="mt-3 rounded-card bg-navy/5 p-3 text-sm text-navy">
            <span className="font-semibold">Descripción del cliente: </span>
            {orden.descripcion_cliente}
          </p>
        )}
      </div>

      <RagCopiloto
        ordenId={orden.id}
        marca={vehiculo?.marca ?? null}
        modelo={vehiculo?.modelo ?? null}
        diagnosticos={diagnosticos}
      />

      <CotizacionPanel ordenId={orden.id} cotizaciones={cotizaciones} />

      <FacturaSection ordenId={orden.id} facturas={facturas} cotizacionLista={!!ultimaCotizacion} />
    </div>
  );
}
