import OpenAI from "openai";
import { buildArgotPromptSnippet } from "./mexicanSlang";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o";
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

export interface RecepcionistaExtraction {
  nombre_cliente: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  sintoma: string | null;
  sintoma_normalizado: string | null;
  respuesta_para_cliente: string;
  listo_para_crear_orden: boolean;
}

const RECEPCIONISTA_SYSTEM_PROMPT = `Eres el recepcionista virtual de un taller mecánico en México. Hablas por WhatsApp con clientes.
Tu trabajo:
1. Saludar de forma cálida y profesional, en español mexicano.
2. Extraer: nombre del cliente, marca y modelo del auto, año (si lo dan) y la falla/síntoma descrito.
3. Los clientes usan argot mexicano para describir piezas y fallas. ${buildArgotPromptSnippet()}
4. Si falta información clave (nombre, modelo del auto o síntoma), pregunta de forma breve y amable por el dato faltante.
5. Cuando ya tengas nombre, modelo del auto y síntoma, confirma con el cliente que un mecánico revisará su caso y que le avisarán por este medio.

Responde SIEMPRE en JSON con este formato exacto (sin texto adicional fuera del JSON):
{
  "nombre_cliente": string | null,
  "marca": string | null,
  "modelo": string | null,
  "anio": number | null,
  "sintoma": string | null,            // descripción literal del cliente
  "sintoma_normalizado": string | null, // traducción a términos técnicos usando el diccionario de argot
  "respuesta_para_cliente": string,     // mensaje de WhatsApp a enviar de vuelta
  "listo_para_crear_orden": boolean      // true si ya hay nombre, modelo y síntoma
}`;

/**
 * Flujo A: Bot Recepcionista. Recibe el historial reciente de la conversación
 * (texto, y opcionalmente transcripción de audio) y devuelve los datos
 * extraídos + la respuesta a enviar por WhatsApp.
 */
export async function ejecutarBotRecepcionista(
  historial: { role: "user" | "assistant"; content: string }[]
): Promise<RecepcionistaExtraction> {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RECEPCIONISTA_SYSTEM_PROMPT },
      ...historial,
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw) as RecepcionistaExtraction;
}

/** Transcribe una nota de voz de WhatsApp (audio) usando Whisper */
export async function transcribirAudio(audioBuffer: Buffer, filename = "audio.ogg"): Promise<string> {
  const openai = getOpenAIClient();
  const file = await OpenAI.toFile(audioBuffer, filename);
  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "es",
  });
  return transcription.text;
}

/** Analiza una foto del vehículo/falla con visión (gpt-4o) */
export async function analizarImagenVehiculo(imageBase64: string, mimeType: string, contexto: string) {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Eres un mecánico experto. Analiza la imagen enviada por un cliente de taller mexicano y describe brevemente lo que observas (daños, fugas, piezas visibles, advertencias en el tablero, etc.) en español, en un párrafo corto.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: contexto || "Analiza esta imagen del vehículo." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      },
    ],
  });
  return completion.choices[0]?.message?.content || "";
}

/** Genera el embedding (1536 dim, text-embedding-3-small) de un texto */
export async function generarEmbedding(texto: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texto,
  });
  return response.data[0].embedding;
}

/**
 * Flujo B: Copiloto RAG. Dado un síntoma/código (ej. P0300) y los fragmentos
 * de manuales recuperados por similitud, resume el procedimiento de revisión.
 */
export async function resumirProcedimientoRAG(
  consulta: string,
  fragmentos: { contenido_texto: string; marca: string | null; modelo: string | null; similarity: number }[]
): Promise<string> {
  const openai = getOpenAIClient();

  const contexto = fragmentos
    .map(
      (f, i) =>
        `Fragmento ${i + 1} (${f.marca ?? "marca desconocida"} ${f.modelo ?? ""}, similitud ${f.similarity.toFixed(2)}):\n${f.contenido_texto}`
    )
    .join("\n\n---\n\n");

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Eres el copiloto de diagnóstico de un mecánico mexicano. Recibirás fragmentos de manuales de taller relevantes y la consulta del mecánico (un síntoma o código de falla, ej. P0300). Resume en pasos numerados, claros y accionables, el procedimiento de revisión. Si los fragmentos no son suficientes, dilo y sugiere qué información adicional revisar. Responde en español, de forma breve y directa para leerse en un celular.",
      },
      {
        role: "user",
        content: `Consulta del mecánico: ${consulta}\n\nFragmentos de manuales:\n${contexto || "(sin resultados)"}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content || "";
}

export interface RefaccionExtraida {
  nombre: string;
  cantidad: number;
  notas?: string;
}

/**
 * Flujo C: Extrae las refacciones mencionadas por el mecánico (texto dictado)
 * como entidades estructuradas para cotizar con distribuidores.
 */
export async function extraerRefacciones(textoDictado: string): Promise<RefaccionExtraida[]> {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Extrae las refacciones automotrices mencionadas en el texto de un mecánico mexicano (puede usar argot). ${buildArgotPromptSnippet()}
Responde en JSON: { "refacciones": [{ "nombre": string, "cantidad": number, "notas": string | null }] }. "nombre" debe usar el término técnico estándar.`,
      },
      { role: "user", content: textoDictado },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{"refacciones": []}';
  const parsed = JSON.parse(raw) as { refacciones: RefaccionExtraida[] };
  return parsed.refacciones || [];
}
