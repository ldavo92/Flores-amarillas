import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generarEmbedding } from "@/lib/openai";
// Import del subpath para evitar el código de "modo debug" del índice de pdf-parse
// (que intenta leer un PDF de prueba del disco al cargarse en bundlers como Next.js).
import pdfParse from "pdf-parse/lib/pdf-parse.js";

function chunkText(texto: string, chunkSize = 1200, overlap = 200): string[] {
  const limpio = texto.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let start = 0;
  while (start < limpio.length) {
    const end = Math.min(start + chunkSize, limpio.length);
    chunks.push(limpio.slice(start, end));
    if (end === limpio.length) break;
    start = end - overlap;
  }
  return chunks.filter((c) => c.length > 50);
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: perfil } = await supabase.from("perfiles").select("taller_id").eq("id", user.id).single();
  if (!perfil?.taller_id) {
    return NextResponse.json({ error: "Usuario sin taller asignado" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const marca = (formData.get("marca") as string | null) || null;
  const modelo = (formData.get("modelo") as string | null) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo PDF" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await pdfParse(buffer);
  const chunks = chunkText(parsed.text);

  let insertados = 0;
  for (const chunk of chunks) {
    const embedding = await generarEmbedding(chunk);
    const { error } = await supabase.from("manuales_embeddings").insert({
      taller_id: perfil.taller_id,
      marca,
      modelo,
      fuente: file.name,
      contenido_texto: chunk,
      embedding: embedding as unknown as number[],
    });
    if (!error) insertados++;
  }

  return NextResponse.json({ ok: true, fragmentos: chunks.length, insertados });
}
