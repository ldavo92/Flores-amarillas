# GANA EN 10: Supervivencia — Guía rápida

Game show de eliminación en tiempo real para videollamadas. El anfitrión controla
todo desde su celular/laptop y la pantalla pública (limpia, sin botones) se proyecta
o comparte en la llamada.

## Correr en local

```bash
npm install
cp .env.example .env   # y rellena las claves de Supabase
npm run dev            # http://localhost:5173
```

## Configurar Supabase

1. Crea un proyecto en https://supabase.com
2. SQL Editor → ejecuta `supabase/schema.sql`
3. Project Settings → API → copia `Project URL` y `anon public key` al `.env`:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Desplegar

El repo ya incluye config para SPA (rewrites para que `/host/...` y `/screen/...`
no den 404 al recargar):

- **Vercel** → `vercel.json`
- **Netlify** → `netlify.toml` + `public/_redirects`

Pasos:

1. Conecta el repo de GitHub en Vercel o Netlify.
2. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Deploy. Build command: `npm run build` (`vite build`), output: `dist`.

### Deploy por CLI a un proyecto Vercel existente

Hay un script que automatiza el deploy usando un token scoped al proyecto
(`vcp_...`). Obtiene el `ORG_ID` desde la API, vincula el proyecto y publica:

```bash
export VERCEL_TOKEN="vcp_xxx"          # token de Vercel
./scripts/deploy-vercel.sh             # producción
./scripts/deploy-vercel.sh --preview   # preview
```

> Requiere salida de red hacia `*.vercel.com`. En Claude Code on the web esto
> implica poner el entorno en **Network access: Custom** y añadir `*.vercel.com`.
> El `VERCEL_PROJECT_ID` por defecto es el de este repo (editable en el script
> o vía la variable de entorno del mismo nombre).

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Landing / crear sala |
| `/host/:code` | Consola privada del anfitrión |
| `/screen/:code` | Pantalla pública (solo visual) |
| `/join/:code` | Registro de jugadores desde otro dispositivo |
