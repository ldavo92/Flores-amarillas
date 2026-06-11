-- =========================================================
-- Row Level Security: aislamiento multi-tenant por taller
-- =========================================================

-- Helper: taller_id del usuario autenticado actual
create or replace function current_taller_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select taller_id from perfiles where id = auth.uid()
$$;

-- Helper: rol del usuario autenticado actual
create or replace function current_rol()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select rol from perfiles where id = auth.uid()
$$;

-- ---------------------------------------------------------
-- talleres
-- ---------------------------------------------------------
alter table talleres enable row level security;

create policy "talleres_select_propio" on talleres
  for select using (id = current_taller_id());

create policy "talleres_update_admin" on talleres
  for update using (id = current_taller_id() and current_rol() = 'admin');

-- ---------------------------------------------------------
-- perfiles
-- ---------------------------------------------------------
alter table perfiles enable row level security;

create policy "perfiles_select_propio_taller" on perfiles
  for select using (id = auth.uid() or taller_id = current_taller_id());

create policy "perfiles_update_propio" on perfiles
  for update using (id = auth.uid());

create policy "perfiles_insert_propio" on perfiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------
-- clientes
-- ---------------------------------------------------------
alter table clientes enable row level security;

create policy "clientes_por_taller" on clientes
  for all using (taller_id = current_taller_id())
  with check (taller_id = current_taller_id());

-- ---------------------------------------------------------
-- vehiculos
-- ---------------------------------------------------------
alter table vehiculos enable row level security;

create policy "vehiculos_por_taller" on vehiculos
  for all using (taller_id = current_taller_id())
  with check (taller_id = current_taller_id());

-- ---------------------------------------------------------
-- ordenes_trabajo
-- ---------------------------------------------------------
alter table ordenes_trabajo enable row level security;

create policy "ordenes_por_taller" on ordenes_trabajo
  for all using (taller_id = current_taller_id())
  with check (taller_id = current_taller_id());

-- ---------------------------------------------------------
-- diagnosticos_ia (vía orden)
-- ---------------------------------------------------------
alter table diagnosticos_ia enable row level security;

create policy "diagnosticos_por_taller" on diagnosticos_ia
  for all using (
    exists (
      select 1 from ordenes_trabajo o
      where o.id = diagnosticos_ia.orden_id
        and o.taller_id = current_taller_id()
    )
  )
  with check (
    exists (
      select 1 from ordenes_trabajo o
      where o.id = diagnosticos_ia.orden_id
        and o.taller_id = current_taller_id()
    )
  );

-- ---------------------------------------------------------
-- cotizaciones (vía orden)
-- ---------------------------------------------------------
alter table cotizaciones enable row level security;

create policy "cotizaciones_por_taller" on cotizaciones
  for all using (
    exists (
      select 1 from ordenes_trabajo o
      where o.id = cotizaciones.orden_id
        and o.taller_id = current_taller_id()
    )
  )
  with check (
    exists (
      select 1 from ordenes_trabajo o
      where o.id = cotizaciones.orden_id
        and o.taller_id = current_taller_id()
    )
  );

-- ---------------------------------------------------------
-- manuales_embeddings
-- visibles para el taller dueño o manuales globales (taller_id null)
-- ---------------------------------------------------------
alter table manuales_embeddings enable row level security;

create policy "manuales_select" on manuales_embeddings
  for select using (taller_id is null or taller_id = current_taller_id());

create policy "manuales_modificar_propio_taller" on manuales_embeddings
  for all using (taller_id = current_taller_id())
  with check (taller_id = current_taller_id());

-- ---------------------------------------------------------
-- whatsapp_mensajes
-- ---------------------------------------------------------
alter table whatsapp_mensajes enable row level security;

create policy "whatsapp_por_taller" on whatsapp_mensajes
  for all using (taller_id = current_taller_id())
  with check (taller_id = current_taller_id());

-- ---------------------------------------------------------
-- facturas (vía orden)
-- ---------------------------------------------------------
alter table facturas enable row level security;

create policy "facturas_por_taller" on facturas
  for all using (
    exists (
      select 1 from ordenes_trabajo o
      where o.id = facturas.orden_id
        and o.taller_id = current_taller_id()
    )
  )
  with check (
    exists (
      select 1 from ordenes_trabajo o
      where o.id = facturas.orden_id
        and o.taller_id = current_taller_id()
    )
  );
