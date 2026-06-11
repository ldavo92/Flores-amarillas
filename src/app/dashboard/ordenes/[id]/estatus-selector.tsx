"use client";

import { useTransition } from "react";
import { actualizarEstatusOrden } from "@/app/dashboard/actions";
import type { EstatusOrden } from "@/types/database";

const OPCIONES: { value: EstatusOrden; label: string }[] = [
  { value: "recepcion", label: "Recepción" },
  { value: "cotizando", label: "Cotizando" },
  { value: "esperando_piezas", label: "Esperando piezas" },
  { value: "en_reparacion", label: "En reparación" },
  { value: "listo", label: "Listo" },
  { value: "entregado", label: "Entregado" },
];

export function EstatusSelector({ ordenId, estatus }: { ordenId: string; estatus: EstatusOrden }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={estatus}
      disabled={pending}
      onChange={(e) => startTransition(() => actualizarEstatusOrden(ordenId, e.target.value as EstatusOrden))}
      className="input-field !h-12 w-full font-semibold sm:w-64"
    >
      {OPCIONES.map((op) => (
        <option key={op.value} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  );
}
