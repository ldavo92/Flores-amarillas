import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generarEmbedding, resumirProcedimientoRAG } from "@/lib/openai";

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

  const body = await request.json();
  const consulta = String(body.consulta || "").trim();
  const marca = body.marca ? String(body.marca) : null;
  const modelo = body.modelo ? String(body.modelo) : null;

  if (!consulta) {
    return NextResponse.json({ error: "Falta el campo 'consulta'" }, { status: 400 });
  }

  const embedding = await generarEmbedding(consulta);

  const { data: fragmentos, error } = await supabase.rpc("match_manuales", {
    query_embedding: embedding,
    match_taller_id: perfil.taller_id,
    match_count: 5,
    filtro_marca: marca,
    filtro_modelo: modelo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const respuesta = await resumirProcedimientoRAG(consulta, fragmentos ?? []);

  return NextResponse.json({ respuesta, fragmentos: fragmentos ?? [] });
}
