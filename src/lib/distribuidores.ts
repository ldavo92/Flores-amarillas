import type { RefaccionExtraida } from "./openai";

export interface ResultadoRefaccion {
  nombre: string;
  cantidad: number;
  precio: number | null;
  disponibilidad: "disponible" | "agotado" | "desconocido";
  distribuidor: string | null;
}

/**
 * Conecta con distribuidores mayoristas de refacciones (ej. Jetz App u otra
 * integración regional) para obtener costo y disponibilidad en tiempo real.
 *
 * Configurar DISTRIBUIDOR_API_URL / DISTRIBUIDOR_API_KEY para usar un proveedor
 * real. Si no están configuradas, se devuelve disponibilidad "desconocido"
 * para que el mecánico capture el precio manualmente.
 */
export async function buscarRefaccionesEnDistribuidores(
  refacciones: RefaccionExtraida[]
): Promise<ResultadoRefaccion[]> {
  const apiUrl = process.env.DISTRIBUIDOR_API_URL;
  const apiKey = process.env.DISTRIBUIDOR_API_KEY;

  if (!apiUrl) {
    return refacciones.map((r) => ({
      nombre: r.nombre,
      cantidad: r.cantidad,
      precio: null,
      disponibilidad: "desconocido",
      distribuidor: null,
    }));
  }

  const response = await fetch(`${apiUrl}/buscar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ refacciones }),
  });

  if (!response.ok) {
    throw new Error(`Error del distribuidor (${response.status})`);
  }

  const data = (await response.json()) as { resultados: ResultadoRefaccion[] };
  return data.resultados;
}
