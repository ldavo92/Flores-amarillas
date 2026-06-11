-- =========================================================
-- Búsqueda semántica (RAG) sobre manuales_embeddings
-- =========================================================

-- Índice HNSW para búsqueda de similitud por coseno a gran escala
create index if not exists manuales_embeddings_hnsw_idx
  on manuales_embeddings
  using hnsw (embedding vector_cosine_ops);

-- Función de búsqueda: top-N fragmentos más similares al query embedding
create or replace function match_manuales(
  query_embedding vector(1536),
  match_taller_id uuid,
  match_count int default 5,
  filtro_marca text default null,
  filtro_modelo text default null
)
returns table (
  id uuid,
  marca text,
  modelo text,
  fuente text,
  contenido_texto text,
  similarity float
)
language sql
stable
as $$
  select
    m.id,
    m.marca,
    m.modelo,
    m.fuente,
    m.contenido_texto,
    1 - (m.embedding <=> query_embedding) as similarity
  from manuales_embeddings m
  where (m.taller_id is null or m.taller_id = match_taller_id)
    and (filtro_marca is null or m.marca ilike filtro_marca)
    and (filtro_modelo is null or m.modelo ilike filtro_modelo)
  order by m.embedding <=> query_embedding
  limit match_count
$$;
