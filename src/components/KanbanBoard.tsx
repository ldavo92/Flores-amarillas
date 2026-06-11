"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { actualizarEstatusOrden } from "@/app/dashboard/actions";
import { OrderCard, type OrdenKanbanItem } from "./OrderCard";
import type { EstatusOrden } from "@/types/database";

const COLUMNS: { key: EstatusOrden; label: string; accent: string }[] = [
  { key: "recepcion", label: "Recepción", accent: "border-t-slate-400" },
  { key: "cotizando", label: "Cotizando", accent: "border-t-amber-400" },
  { key: "esperando_piezas", label: "Esperando piezas", accent: "border-t-orange-400" },
  { key: "en_reparacion", label: "En reparación", accent: "border-t-accent" },
  { key: "listo", label: "Listo", accent: "border-t-success" },
  { key: "entregado", label: "Entregado", accent: "border-t-navy/40" },
];

function agruparPorEstatus(ordenes: OrdenKanbanItem[]) {
  const grupos: Record<EstatusOrden, OrdenKanbanItem[]> = {
    recepcion: [],
    cotizando: [],
    esperando_piezas: [],
    en_reparacion: [],
    listo: [],
    entregado: [],
  };
  for (const orden of ordenes) {
    grupos[orden.estatus]?.push(orden);
  }
  return grupos;
}

export function KanbanBoard({ ordenes, tallerId }: { ordenes: OrdenKanbanItem[]; tallerId: string }) {
  const [grupos, setGrupos] = useState(() => agruparPorEstatus(ordenes));
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setGrupos(agruparPorEstatus(ordenes));
  }, [ordenes]);

  // Tablero en tiempo real: cualquier cambio en ordenes_trabajo del taller refresca el server component
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`ordenes-taller-${tallerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordenes_trabajo", filter: `taller_id=eq.${tallerId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tallerId, router]);

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const origenKey = source.droppableId as EstatusOrden;
    const destinoKey = destination.droppableId as EstatusOrden;

    setGrupos((prev) => {
      const copia = { ...prev, [origenKey]: [...prev[origenKey]], [destinoKey]: [...prev[destinoKey]] };
      const [movido] = copia[origenKey].splice(source.index, 1);
      if (!movido) return prev;
      const actualizado = { ...movido, estatus: destinoKey };
      copia[destinoKey].splice(destination.index, 0, actualizado);
      return copia;
    });

    startTransition(() => {
      actualizarEstatusOrden(draggableId, destinoKey).catch(() => router.refresh());
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="w-[260px] shrink-0 sm:w-[280px]">
            <div className={`mb-2 rounded-card border-t-4 bg-white px-3 py-2 shadow-sm ${col.accent}`}>
              <h2 className="text-sm font-bold text-navy">{col.label}</h2>
              <span className="text-xs text-navy/50">{grupos[col.key].length} órdenes</span>
            </div>
            <Droppable droppableId={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[120px] rounded-card p-1 transition ${
                    snapshot.isDraggingOver ? "bg-accent/10" : ""
                  }`}
                >
                  {grupos[col.key].map((orden, index) => (
                    <Draggable key={orden.id} draggableId={orden.id} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          style={{
                            ...dragProvided.draggableProps.style,
                            opacity: dragSnapshot.isDragging ? 0.85 : 1,
                          }}
                        >
                          <OrderCard orden={orden} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
