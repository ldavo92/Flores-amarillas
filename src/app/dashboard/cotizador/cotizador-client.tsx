"use client";

import { useState } from "react";

interface Resultado {
  nombre: string;
  cantidad: number;
  precio: number | null;
  disponibilidad: "disponible" | "agotado" | "desconocido";
  distribuidor: string | null;
}

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function CotizadorClient() {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cotizar() {
    if (!texto.trim()) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/refacciones/cotizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cotizar");
      setResultados(data.refacciones || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card space-y-3">
      <p className="text-sm text-navy/70">
        Dicta o escribe las refacciones que necesitas (puedes usar argot mexicano, ej. &quot;licuadora&quot;,
        &quot;cacahuate&quot;). La IA extrae las piezas y consulta disponibilidad/precio con los
        distribuidores configurados.
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder='Ej. "necesito 2 balatas delanteras y una bobina para un Nissan Versa 2018"'
        className="input-field !h-auto py-3"
      />
      <button onClick={cotizar} disabled={cargando} className="btn-primary w-full">
        {cargando ? "Cotizando..." : "Cotizar refacciones"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {resultados.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-navy/50">
              <th className="py-1">Refacción</th>
              <th className="py-1">Cant.</th>
              <th className="py-1">Precio</th>
              <th className="py-1">Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((r, i) => (
              <tr key={i} className="border-t border-navy/5">
                <td className="py-2 font-semibold text-navy">{r.nombre}</td>
                <td className="py-2">{r.cantidad}</td>
                <td className="py-2">{r.precio != null ? moneda.format(r.precio) : "—"}</td>
                <td className="py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      r.disponibilidad === "disponible"
                        ? "bg-success/10 text-success"
                        : r.disponibilidad === "agotado"
                          ? "bg-red-100 text-red-600"
                          : "bg-navy/5 text-navy/50"
                    }`}
                  >
                    {r.disponibilidad}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
