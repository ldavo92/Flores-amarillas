"use client";

import { useState } from "react";
import type { EstatusFactura } from "@/types/database";

interface Factura {
  id: string;
  estatus: EstatusFactura;
  uuid_fiscal: string | null;
  pdf_url: string | null;
  xml_url: string | null;
  total: number | null;
  created_at: string;
}

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function FacturaSection({
  ordenId,
  facturas,
  cotizacionLista,
}: {
  ordenId: string;
  facturas: Factura[];
  cotizacionLista: boolean;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lista, setLista] = useState(facturas);

  async function timbrar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/facturacion/timbrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordenId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo generar la factura");
      setLista((prev) => [...prev, data.factura]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-base font-bold text-navy">Facturación CFDI 4.0</h2>
      <p className="text-xs text-navy/60">
        Genera el CFDI con clave de producto/servicio 78181507 (reparación y mantenimiento automotor) y
        clave de unidad E48 (unidad de servicio), separando mano de obra y refacciones.
      </p>

      <button onClick={timbrar} disabled={cargando || !cotizacionLista} className="btn-primary w-full">
        {cargando ? "Timbrando..." : "Generar factura CFDI"}
      </button>
      {!cotizacionLista && (
        <p className="text-xs text-navy/40">Primero registra una cotización para esta orden.</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {lista.length > 0 && (
        <ul className="space-y-2">
          {[...lista].reverse().map((f) => (
            <li key={f.id} className="rounded-card bg-navy/5 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{f.total ? moneda.format(f.total) : "—"}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    f.estatus === "timbrada"
                      ? "bg-success/10 text-success"
                      : f.estatus === "error"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {f.estatus}
                </span>
              </div>
              {f.uuid_fiscal && <p className="text-xs text-navy/50">UUID: {f.uuid_fiscal}</p>}
              {(f.pdf_url || f.xml_url) && (
                <div className="mt-1 flex gap-3 text-xs font-semibold text-accent">
                  {f.pdf_url && (
                    <a href={f.pdf_url} target="_blank" rel="noreferrer">
                      PDF
                    </a>
                  )}
                  {f.xml_url && (
                    <a href={f.xml_url} target="_blank" rel="noreferrer">
                      XML
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
