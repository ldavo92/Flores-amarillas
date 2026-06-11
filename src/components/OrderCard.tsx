import Link from "next/link";
import type { EstatusOrden } from "@/types/database";

export interface OrdenKanbanItem {
  id: string;
  estatus: EstatusOrden;
  descripcion_cliente: string | null;
  created_at: string;
  vehiculo: {
    marca: string | null;
    modelo: string | null;
    anio: number | null;
    placas: string | null;
  };
  cliente: { nombre: string | null };
}

export function OrderCard({ orden }: { orden: OrdenKanbanItem }) {
  const { vehiculo, cliente } = orden;

  return (
    <Link
      href={`/dashboard/ordenes/${orden.id}`}
      className="card mb-2 block border border-navy/5 transition hover:border-accent/40 hover:shadow-md"
    >
      <p className="text-sm font-bold text-navy">
        {vehiculo.marca || "Sin marca"} {vehiculo.modelo || ""} {vehiculo.anio || ""}
      </p>
      {vehiculo.placas && <p className="text-xs text-navy/50">Placas: {vehiculo.placas}</p>}
      <p className="mt-1 text-xs font-medium text-navy/70">{cliente.nombre || "Cliente sin nombre"}</p>
      {orden.descripcion_cliente && (
        <p className="mt-2 line-clamp-2 text-xs text-navy/60">{orden.descripcion_cliente}</p>
      )}
    </Link>
  );
}
