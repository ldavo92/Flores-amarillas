import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { decryptFieldSafe } from "@/lib/crypto";
import { KanbanBoard } from "@/components/KanbanBoard";
import type { OrdenKanbanItem } from "@/components/OrderCard";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("taller_id")
    .eq("id", user!.id)
    .single();

  const tallerId = perfil?.taller_id;

  if (!tallerId) {
    return (
      <div className="card">
        <p className="text-navy">
          Tu cuenta todavía no está vinculada a un taller. Contacta al administrador.
        </p>
      </div>
    );
  }

  const { data: ordenes, error } = await supabase
    .from("ordenes_trabajo")
    .select(
      "id, estatus, descripcion_cliente, created_at, vehiculos ( marca, modelo, anio, placas_enc ), clientes ( nombre )"
    )
    .eq("taller_id", tallerId)
    .order("created_at", { ascending: true });

  const ordenesKanban: OrdenKanbanItem[] = (ordenes ?? []).map((o) => {
    const vehiculo = Array.isArray(o.vehiculos) ? o.vehiculos[0] : o.vehiculos;
    const cliente = Array.isArray(o.clientes) ? o.clientes[0] : o.clientes;
    return {
      id: o.id,
      estatus: o.estatus,
      descripcion_cliente: o.descripcion_cliente,
      created_at: o.created_at,
      vehiculo: {
        marca: vehiculo?.marca ?? null,
        modelo: vehiculo?.modelo ?? null,
        anio: vehiculo?.anio ?? null,
        placas: decryptFieldSafe(vehiculo?.placas_enc ?? null),
      },
      cliente: { nombre: cliente?.nombre ?? null },
    };
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">Tablero de órdenes</h1>
        <Link href="/dashboard/ordenes/nueva" className="btn-primary">
          + Nueva orden
        </Link>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error.message}</p>}
      <KanbanBoard ordenes={ordenesKanban} tallerId={tallerId} />
    </div>
  );
}
