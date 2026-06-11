"use client";

import { useState } from "react";

interface Fragmento {
  id: string;
  marca: string | null;
  modelo: string | null;
  fuente: string | null;
  contenido_texto: string;
  similarity: number;
}

export function ManualesClient() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [marcaSubida, setMarcaSubida] = useState("");
  const [modeloSubida, setModeloSubida] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensajeSubida, setMensajeSubida] = useState<string | null>(null);

  const [consulta, setConsulta] = useState("");
  const [marcaConsulta, setMarcaConsulta] = useState("");
  const [modeloConsulta, setModeloConsulta] = useState("");
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [fragmentos, setFragmentos] = useState<Fragmento[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subirManual() {
    if (!archivo) return;
    setSubiendo(true);
    setMensajeSubida(null);
    try {
      const formData = new FormData();
      formData.append("file", archivo);
      if (marcaSubida) formData.append("marca", marcaSubida);
      if (modeloSubida) formData.append("modelo", modeloSubida);

      const res = await fetch("/api/manuales/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir el manual");
      setMensajeSubida(`Manual procesado: ${data.insertados}/${data.fragmentos} fragmentos indexados.`);
      setArchivo(null);
    } catch (e) {
      setMensajeSubida(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubiendo(false);
    }
  }

  async function consultar() {
    if (!consulta.trim()) return;
    setBuscando(true);
    setError(null);
    setRespuesta(null);
    try {
      const res = await fetch("/api/manuales/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consulta, marca: marcaConsulta || null, modelo: modeloConsulta || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar");
      setRespuesta(data.respuesta);
      setFragmentos(data.fragmentos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="text-base font-bold text-navy">Subir manual de taller (PDF)</h2>
        <p className="text-xs text-navy/60">
          El PDF se divide en fragmentos, se convierte en embeddings (text-embedding-3-small) y se guarda
          en pgvector para búsqueda semántica.
        </p>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={marcaSubida}
            onChange={(e) => setMarcaSubida(e.target.value)}
            placeholder="Marca (opcional)"
            className="input-field"
          />
          <input
            value={modeloSubida}
            onChange={(e) => setModeloSubida(e.target.value)}
            placeholder="Modelo (opcional)"
            className="input-field"
          />
        </div>
        <button onClick={subirManual} disabled={!archivo || subiendo} className="btn-primary w-full">
          {subiendo ? "Procesando..." : "Subir e indexar"}
        </button>
        {mensajeSubida && <p className="text-sm text-navy">{mensajeSubida}</p>}
      </div>

      <div className="card space-y-3">
        <h2 className="text-base font-bold text-navy">Buscar en manuales</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={marcaConsulta}
            onChange={(e) => setMarcaConsulta(e.target.value)}
            placeholder="Marca (opcional)"
            className="input-field"
          />
          <input
            value={modeloConsulta}
            onChange={(e) => setModeloConsulta(e.target.value)}
            placeholder="Modelo (opcional)"
            className="input-field"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ej. P0300, ruido al frenar"
            className="input-field flex-1"
          />
          <button onClick={consultar} disabled={buscando} className="btn-primary sm:w-40">
            {buscando ? "Buscando..." : "Consultar"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {respuesta && (
          <div className="space-y-2">
            <div className="rounded-card bg-accent/5 p-3 text-sm text-navy whitespace-pre-wrap">{respuesta}</div>
            {fragmentos.length > 0 && (
              <details className="text-xs text-navy/60">
                <summary className="cursor-pointer font-semibold">
                  Fragmentos usados ({fragmentos.length})
                </summary>
                <ul className="mt-2 space-y-2">
                  {fragmentos.map((f) => (
                    <li key={f.id} className="rounded-card bg-navy/5 p-2">
                      <p className="font-semibold">
                        {f.marca} {f.modelo} ({f.fuente}) · similitud {f.similarity.toFixed(2)}
                      </p>
                      <p className="line-clamp-3">{f.contenido_texto}</p>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
