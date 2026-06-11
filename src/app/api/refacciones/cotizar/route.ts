import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extraerRefacciones } from "@/lib/openai";
import { buscarRefaccionesEnDistribuidores } from "@/lib/distribuidores";

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const texto = String(body.texto || "").trim();

  if (!texto) {
    return NextResponse.json({ error: "Falta el campo 'texto'" }, { status: 400 });
  }

  const refacciones = await extraerRefacciones(texto);
  const resultados = await buscarRefaccionesEnDistribuidores(refacciones);

  return NextResponse.json({ refacciones: resultados });
}
