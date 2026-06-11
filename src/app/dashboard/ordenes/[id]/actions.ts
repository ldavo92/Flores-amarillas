"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstatusAprobacion } from "@/types/database";

const IVA_RATE = 0.16;

export interface RefaccionLinea {
  nombre: string;
  precio: number;
  cantidad: number;
  disponibilidad?: string;
}

export interface CotizacionState {
  error?: string;
  ok?: boolean;
}

export async function guardarCotizacion(
  ordenId: string,
  manoObra: number,
  refacciones: RefaccionLinea[]
): Promise<CotizacionState> {
  const supabase = createClient();

  const totalRefacciones = refacciones.reduce((acc, r) => acc + r.precio * r.cantidad, 0);
  const subtotal = manoObra + totalRefacciones;
  const iva = Math.round(subtotal * IVA_RATE * 100) / 100;
  const total = Math.round((subtotal + iva) * 100) / 100;

  const { error } = await supabase.from("cotizaciones").insert({
    orden_id: ordenId,
    mano_obra: manoObra,
    refacciones,
    subtotal: Math.round(subtotal * 100) / 100,
    iva,
    total,
    estatus_aprobacion: "pendiente",
  });

  if (error) return { error: error.message };

  await supabase.from("ordenes_trabajo").update({ estatus: "cotizando" }).eq("id", ordenId);

  revalidatePath(`/dashboard/ordenes/${ordenId}`);
  return { ok: true };
}

export async function actualizarAprobacionCotizacion(
  cotizacionId: string,
  ordenId: string,
  estatus: EstatusAprobacion
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cotizaciones")
    .update({ estatus_aprobacion: estatus })
    .eq("id", cotizacionId);

  if (error) throw new Error(error.message);

  if (estatus === "aprobada") {
    await supabase.from("ordenes_trabajo").update({ estatus: "esperando_piezas" }).eq("id", ordenId);
  }

  revalidatePath(`/dashboard/ordenes/${ordenId}`);
}

export async function guardarAnalisisIA(
  ordenId: string,
  transcripcion: string,
  analisis: string,
  sugerenciaPiezas: unknown[]
) {
  const supabase = createClient();
  const { error } = await supabase.from("diagnosticos_ia").insert({
    orden_id: ordenId,
    transcripcion_audio: transcripcion || null,
    analisis_rag: analisis,
    sugerencia_piezas: sugerenciaPiezas,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/ordenes/${ordenId}`);
}
