"use client";

import { useState, useTransition } from "react";
import { guardarAnalisisIA } from "./actions";

interface Diagnostico {
  id: string;
  transcripcion_audio: string | null;
  analisis_rag: string | null;
  sugerencia_piezas: unknown[];
  created_at: string;
}

interface Fragmento {
  id: string;
  marca: string | null;
  modelo: string | null;
  fuente: string | null;
  contenido_texto: string;
  similarity: number;
}

export function RagCopiloto({
  ordenId,
  marca,
  modelo,
  diagnosticos,
}: {
  ordenId: string;
  marca: string | null;
  modelo: string | null;
  diagnosticos: Diagnostico[];
}) {
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [fragmentos, setFragmentos] = useState<Fragmento[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function consultar() {
    if (!consulta.trim()) return;
    setCargando(true);
    setError(null);
    setRespuesta(null);
    try {
      const res = await fetch("/api/manuales/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta, marca, modelo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar");
      setRespuesta(data.respuesta);
      setFragmentos(data.fragmentos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  function guardar() {
    if (!respuesta) return;
    startTransition(() => {
      guardarAnalisisIA(ordenId, consulta, respuesta, []);
    });
  }

  return (
    <div className="card">
      <h2 className="mb-2 text-base font-bold text-navy">Copiloto de diagnóstico (RAG)</h2>
      <p className="mb-3 text-xs text-navy/60">
        Escribe un síntoma o código de falla (ej. &quot;P0300&quot; o &quot;ruido al frenar&quot;) para
        recibir el procedimiento de revisión basado en los manuales cargados.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Ej. P0300, falla de encendido"
          className="input-field flex-1"
        />
        <button onClick={consultar} disabled={cargando} className="btn-primary sm:w-40">
          {cargando ? "Buscando..." : "Consultar"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {respuesta && (
        <div className="mt-3 space-y-2">
          <div className="rounded-card bg-accent/5 p-3 text-sm text-navy whitespace-pre-wrap">{respuesta}</div>
          {fragmentos.length > 0 && (
            <details className="text-xs text-navy/60">
              <summary className="cursor-pointer font-semibold">
                Fragmentos de manuales usados ({fragmentos.length})
              </summary>
              <ul className="mt-2 space-y-2">
                {fragmentos.map((f) => (
                  <li key={f.id} className="rounded-card bg-navy/5 p-2">
                    <p className="font-semibold">
                      {f.marca} {f.modelo} · similitud {f.similarity.toFixed(2)}
                    </p>
                    <p className="line-clamp-3">{f.contenido_texto}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button onClick={guardar} disabled={pending} className="btn-secondary">
            {pending ? "Guardando..." : "Guardar en historial de la orden"}
          </button>
        </div>
      )}

      {diagnosticos.filter((d) => d.analisis_rag).length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-navy">
            Historial de diagnósticos ({diagnosticos.filter((d) => d.analisis_rag).length})
          </summary>
          <ul className="mt-2 space-y-2">
            {diagnosticos
              .filter((d) => d.analisis_rag)
              .map((d) => (
                <li key={d.id} className="rounded-card bg-navy/5 p-2 text-sm whitespace-pre-wrap">
                  {d.analisis_rag}
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}
