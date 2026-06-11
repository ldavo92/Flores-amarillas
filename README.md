# Taller SaaS — Plataforma para talleres mecánicos en México

Plataforma SaaS híbrida para gestionar y automatizar talleres mecánicos en México. Clientes y mecánicos interactúan principalmente por WhatsApp, mientras la IA se encarga de la recepción, el pre-diagnóstico, la cotización de refacciones y la facturación CFDI 4.0.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** (PostgreSQL + pgvector + Row Level Security)
- **Tailwind CSS**
- **OpenAI API** (`gpt-4o` para razonamiento/visión, `text-embedding-3-small` para embeddings)
- **Twilio WhatsApp Business API**
- **Facturama** (PAC para CFDI 4.0)

## Arquitectura

- `src/app/dashboard` — Tablero Kanban (Recepción → Cotizando → Esperando piezas → En reparación → Listo → Entregado), gestión de órdenes, manuales y cotizador.
- `src/app/api/whatsapp/webhook` — Webhook de Twilio: recepción del bot conversacional, extracción de datos con IA usando jerga mecánica mexicana, manejo de medios (audio/imagen) y consentimiento LFPDPPP.
- `src/app/api/manuales` — Carga de manuales en PDF, generación de embeddings y búsqueda semántica (RAG) vía pgvector.
- `src/app/api/refacciones/cotizar` — Extracción de refacciones por IA y búsqueda en distribuidores mayoristas.
- `src/app/api/facturacion/timbrar` — Generación y timbrado de CFDI 4.0 vía Facturama.
- `src/lib` — Clientes/utilidades para OpenAI, Twilio, Facturama, catálogo SAT, jerga mecánica, distribuidores y cifrado de datos sensibles.
- `supabase/migrations` — Esquema de base de datos, políticas RLS multi-tenant y configuración de búsqueda vectorial (pgvector + HNSW).

## Cumplimiento legal y fiscal

- Los datos personales sensibles (teléfono, placas) se cifran en la aplicación (AES-256-GCM) antes de guardarse, conforme a la LFPDPPP.
- El bot de WhatsApp envía el aviso de privacidad y requiere consentimiento ("Acepto") antes de registrar datos del cliente.
- Las facturas se generan como CFDI 4.0 con claves del catálogo SAT (servicio de reparación automotriz por defecto), separando "Mano de Obra" y "Refacciones".

## Configuración

1. Copia `.env.example` a `.env.local` y completa las credenciales de Supabase, OpenAI, Twilio, Facturama y la clave de cifrado.
2. Aplica las migraciones de `supabase/migrations` en tu proyecto de Supabase (en orden).
3. Instala dependencias y levanta el entorno de desarrollo:

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — entorno de desarrollo
- `npm run build` — compilación de producción
- `npm run start` — servidor de producción
- `npm run lint` — linter
