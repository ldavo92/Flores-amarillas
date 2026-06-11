-- =========================================================
-- Esquema inicial: SaaS de gestión de talleres mecánicos
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- talleres (tenant)
-- ---------------------------------------------------------
create table if not exists talleres (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  rfc text,
  regimen_fiscal text,
  telefono_whatsapp text not null unique,
  codigo_postal text,
  configuracion_ia jsonb not null default '{}'::jsonb,
  aviso_privacidad_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table talleres is 'Tenants: cada taller mecánico que usa la plataforma';
comment on column talleres.configuracion_ia is 'Prompts/parámetros del bot, claves SAT por defecto, etc.';

-- ---------------------------------------------------------
-- perfiles (usuarios -> auth.users, vinculados a un taller)
-- ---------------------------------------------------------
create table if not exists perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  taller_id uuid references talleres (id) on delete cascade,
  nombre text,
  rol text not null default 'mecanico' check (rol in ('admin', 'mecanico')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- clientes
-- Datos sensibles (teléfono) cifrados a nivel de aplicación
-- (ver src/lib/crypto.ts) para cumplir LFPDPPP.
-- ---------------------------------------------------------
create table if not exists clientes (
  id uuid primary key default uuid_generate_v4(),
  taller_id uuid not null references talleres (id) on delete cascade,
  nombre text,
  telefono_enc text not null,
  telefono_hash text not null,
  email text,
  rfc_facturacion text,
  regimen_fiscal_receptor text,
  codigo_postal text,
  uso_cfdi text default 'G03',
  acepto_aviso_privacidad boolean not null default false,
  aviso_privacidad_fecha timestamptz,
  created_at timestamptz not null default now(),
  unique (taller_id, telefono_hash)
);

create index if not exists idx_clientes_taller on clientes (taller_id);

-- ---------------------------------------------------------
-- vehiculos
-- placas cifradas a nivel de aplicación (LFPDPPP)
-- ---------------------------------------------------------
create table if not exists vehiculos (
  id uuid primary key default uuid_generate_v4(),
  taller_id uuid not null references talleres (id) on delete cascade,
  cliente_id uuid not null references clientes (id) on delete cascade,
  marca text,
  modelo text,
  anio int,
  vin text,
  placas_enc text,
  kilometraje int,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehiculos_cliente on vehiculos (cliente_id);
create index if not exists idx_vehiculos_taller on vehiculos (taller_id);

-- ---------------------------------------------------------
-- ordenes_trabajo
-- ---------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estatus_orden') then
    create type estatus_orden as enum (
      'recepcion',
      'cotizando',
      'esperando_piezas',
      'en_reparacion',
      'listo',
      'entregado'
    );
  end if;
end $$;

create table if not exists ordenes_trabajo (
  id uuid primary key default uuid_generate_v4(),
  taller_id uuid not null references talleres (id) on delete cascade,
  vehiculo_id uuid not null references vehiculos (id) on delete cascade,
  cliente_id uuid not null references clientes (id) on delete cascade,
  estatus estatus_orden not null default 'recepcion',
  descripcion_cliente text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ordenes_taller_estatus on ordenes_trabajo (taller_id, estatus);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ordenes_updated_at on ordenes_trabajo;
create trigger trg_ordenes_updated_at
  before update on ordenes_trabajo
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- diagnosticos_ia
-- ---------------------------------------------------------
create table if not exists diagnosticos_ia (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid not null references ordenes_trabajo (id) on delete cascade,
  transcripcion_audio text,
  analisis_rag text,
  sugerencia_piezas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_diagnosticos_orden on diagnosticos_ia (orden_id);

-- ---------------------------------------------------------
-- cotizaciones
-- ---------------------------------------------------------
create table if not exists cotizaciones (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid not null references ordenes_trabajo (id) on delete cascade,
  mano_obra numeric(10, 2) not null default 0,
  refacciones jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  iva numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  estatus_aprobacion text not null default 'pendiente'
    check (estatus_aprobacion in ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now()
);

create index if not exists idx_cotizaciones_orden on cotizaciones (orden_id);

-- ---------------------------------------------------------
-- manuales_embeddings (RAG - pgvector, text-embedding-3-small)
-- ---------------------------------------------------------
create table if not exists manuales_embeddings (
  id uuid primary key default uuid_generate_v4(),
  taller_id uuid references talleres (id) on delete cascade,
  marca text,
  modelo text,
  fuente text,
  contenido_texto text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_manuales_taller on manuales_embeddings (taller_id);

-- ---------------------------------------------------------
-- whatsapp_mensajes (bitácora del bot recepcionista)
-- ---------------------------------------------------------
create table if not exists whatsapp_mensajes (
  id uuid primary key default uuid_generate_v4(),
  taller_id uuid not null references talleres (id) on delete cascade,
  cliente_id uuid references clientes (id) on delete set null,
  orden_id uuid references ordenes_trabajo (id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text,
  media_url text,
  twilio_sid text,
  created_at timestamptz not null default now()
);

create index if not exists idx_whatsapp_taller on whatsapp_mensajes (taller_id, created_at desc);

-- ---------------------------------------------------------
-- facturas (CFDI 4.0 vía Facturama)
-- ---------------------------------------------------------
create table if not exists facturas (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid not null references ordenes_trabajo (id) on delete cascade,
  facturama_id text,
  uuid_fiscal text,
  serie text,
  folio text,
  clave_producto_servicio text not null default '78181507',
  clave_unidad text not null default 'E48',
  unidad text not null default 'Unidad de servicio',
  total numeric(10, 2),
  xml_url text,
  pdf_url text,
  estatus text not null default 'pendiente'
    check (estatus in ('pendiente', 'timbrada', 'cancelada', 'error')),
  created_at timestamptz not null default now()
);

create index if not exists idx_facturas_orden on facturas (orden_id);
