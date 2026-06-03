---
name: supabase-migration
description: Crear migraciones SQL para Supabase con RLS y seeds del fixture oficial. Usar la estructura del modelo de datos §7 del brief.
---

# Migraciones Supabase

Carpeta destino: `supabase/migrations/`. Cada migración: SQL puro idempotente.

## Convenciones
- Tablas maestras (lectura pública): RLS = `SELECT TO anon, authenticated USING (true)`.
- Tablas de usuario: RLS estricta, `user_id = auth.uid()` para INSERT/UPDATE/DELETE/SELECT.
- `match_events.provider_event_id` UNIQUE para diff idempotente.

## Seed
Importar desde `src/data/teams.ts`, `src/data/matches.ts`, `src/data/cities.ts`.
Generar SQL con un script Node si la cantidad lo amerita; nunca hardcodear.

## Edge functions
Carpeta `supabase/functions/live-poller/`. Cron cada minuto que solo despierta el poller si hay un partido en ventana ±10 min.
