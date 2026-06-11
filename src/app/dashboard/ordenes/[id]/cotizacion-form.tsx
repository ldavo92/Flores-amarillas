"use client";

import { useMemo, useState, useTransition } from "react";
import {
  actualizarAprobacionCotizacion,
  guardarCotizacion,
  type RefaccionLinea,
} from "./actions";
import type { EstatusAprobacion } from "@/types/database";

const IVA_RATE = 0.16;

interface Cotizacion {
  id: string;
  mano_obra: number;
  refacciones: RefaccionLinea[];
  subtotal: number;
  iva: number;
  total: number;
  estatus_aprobacion: EstatusAprobacion;
  created_at: string;
}

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function CotizacionPanel({ ordenId, cotizaciones }: { ordenId: string; cotizaciones: Cotizacion[] }) {
  const [manoObra, setManoObra] = useState(0);
  const [refacciones, setRefacciones] = useState<RefaccionLinea[]>([]);
  const [textoDictado, setTextoDictado] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalRefacciones = useMemo(
    () => refacciones.reduce((acc, r) => acc + r.precio * r.cantidad, 0),
    [refacciones]
  );
  const subtotal = manoObra + totalRefacciones;
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  async function buscarRefacciones() {
    if (!textoDictado.trim()) return;
    setBuscando(true);
    setError(null);
    try {
      const res = await fetch("/api/refacciones/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoDictado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cotizar refacciones");
      const nuevas: RefaccionLinea[] = (data.refacciones || []).map(
        (r: { nombre: string; cantidad: number; precio: number | null; disponibilidad: string }) => ({
          nombre: r.nombre,
          cantidad: r.cantidad,
          precio: r.precio ?? 0,
          disponibilidad: r.disponibilidad,
        })
      );
      setRefacciones((prev) => [...prev, ...nuevas]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBuscando(false);
    }
  }

  function actualizarRefaccion(index: number, campo: keyof RefaccionLinea, valor: string | number) {
    setRefacciones((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [campo]: valor } : r))
    );
  }

  function eliminarRefaccion(index: number) {
    setRefacciones((prev) => prev.filter((_, i) => i !== index));
  }

  function agregarRefaccionVacia() {
    setRefacciones((prev) => [...prev, { nombre: "", precio: 0, cantidad: 1 }]);
  }

  function guardar() {
    setError(null);
    startTransition(async () => {
      const resultado = await guardarCotizacion(ordenId, manoObra, refacciones);
      if (resultado.error) setError(resultado.error);
      else {
        setManoObra(0);
        setRefacciones([]);
        setTextoDictado("");
      }
    });
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-base font-bold text-navy">Cotización</h2>

      <div>
        <label className="mb-1 block text-sm font-semibold text-navy">
          Cotizador rápido (dicta las refacciones)
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={textoDictado}
            onChange={(e) => setTextoDictado(e.target.value)}
            placeholder='Ej. "necesito una bomba de licuadora y un cacahuate"'
            className="input-field flex-1"
          />
          <button onClick={buscarRefacciones} disabled={buscando} className="btn-secondary sm:w-40">
            {buscando ? "Buscando..." : "Agregar piezas"}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-navy">Mano de obra (MXN)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={manoObra}
          onChange={(e) => setManoObra(Number(e.target.value) || 0)}
          className="input-field"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-semibold text-navy">Refacciones</label>
          <button onClick={agregarRefaccionVacia} className="text-sm font-semibold text-accent">
            + Agregar
          </button>
        </div>
        <div className="space-y-2">
          {refacciones.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                value={r.nombre}
                onChange={(e) => actualizarRefaccion(i, "nombre", e.target.value)}
                placeholder="Nombre de la refacción"
                className="input-field col-span-6"
              />
              <input
                type="number"
                min={1}
                value={r.cantidad}
                onChange={(e) => actualizarRefaccion(i, "cantidad", Number(e.target.value) || 1)}
                className="input-field col-span-2"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={r.precio}
                onChange={(e) => actualizarRefaccion(i, "precio", Number(e.target.value) || 0)}
                placeholder="Precio"
                className="input-field col-span-3"
              />
              <button
                onClick={() => eliminarRefaccion(i)}
                className="col-span-1 rounded-card text-red-500"
                aria-label="Eliminar"
              >
                ✕
              </button>
              {r.disponibilidad === "desconocido" && (
                <p className="col-span-12 -mt-1 text-xs text-navy/40">
                  Disponibilidad/precio no encontrado automáticamente: captura el precio manualmente.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-navy/5 p-3 text-sm text-navy">
        <p className="flex justify-between font-semibold">
          <span>Mano de obra</span> <span>{moneda.format(manoObra)}</span>
        </p>
        <p className="flex justify-between font-semibold">
          <span>Refacciones</span> <span>{moneda.format(totalRefacciones)}</span>
        </p>
        <hr className="my-1 border-navy/10" />
        <p className="flex justify-between">
          <span>Subtotal</span> <span>{moneda.format(subtotal)}</span>
        </p>
        <p className="flex justify-between">
          <span>IVA (16%)</span> <span>{moneda.format(iva)}</span>
        </p>
        <p className="flex justify-between text-base font-bold">
          <span>Total</span> <span>{moneda.format(total)}</span>
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={guardar} disabled={guardando} className="btn-success w-full">
        {guardando ? "Guardando..." : "Guardar cotización y enviar al cliente"}
      </button>

      {cotizaciones.length > 0 && (
        <div className="space-y-2 border-t border-navy/10 pt-3">
          <h3 className="text-sm font-bold text-navy">Cotizaciones registradas</h3>
          {[...cotizaciones].reverse().map((c) => (
            <div key={c.id} className="rounded-card bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy">Total: {moneda.format(c.total)}</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    c.estatus_aprobacion === "aprobada"
                      ? "bg-success/10 text-success"
                      : c.estatus_aprobacion === "rechazada"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {c.estatus_aprobacion}
                </span>
              </div>
              <p className="text-xs text-navy/60">
                Mano de obra {moneda.format(c.mano_obra)} · Refacciones{" "}
                {moneda.format(c.refacciones.reduce((a, r) => a + r.precio * r.cantidad, 0))} · IVA{" "}
                {moneda.format(c.iva)}
              </p>
              {c.estatus_aprobacion === "pendiente" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => actualizarAprobacionCotizacion(c.id, ordenId, "aprobada")}
                    className="btn-success !min-h-0 px-3 py-1 text-xs"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => actualizarAprobacionCotizacion(c.id, ordenId, "rechazada")}
                    className="btn-secondary !min-h-0 px-3 py-1 text-xs"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
