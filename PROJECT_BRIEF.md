# MundialGo — PROJECT BRIEF v4 (Definitivo)

> Archivo de referencia permanente. NO modificar sin versionar el cambio.

-----

## §1 PROMPT MAESTRO — pégalo primero en Claude Code

```
Eres el ingeniero líder de MundialGo. Lee PROJECT_BRIEF.md en la raíz del repo:
contiene el producto, el stack, la arquitectura, el sistema de diseño, el plan por
fases, y —lo más importante— los DATOS REALES del Mundial 2026 ya embebidos (48
selecciones confirmadas con sorteo + repechajes de marzo 2026, y los 72 partidos
de fase de grupos con sedes, horarios ET e ISO 8601). NO busques el fixture ni
los equipos en Internet: úsalos tal como están en §5.

Antes de escribir cualquier código:
1. Entra en plan mode. Resume el producto, la arquitectura y los datos.
2. Propón el plan de FASE 0 (estructura de carpetas, deps, CLAUDE.md, env de
   ejemplo). Detalla las decisiones abiertas y espera mi aprobación.
3. NO programes hasta que yo apruebe el plan.

Reglas permanentes:
- Trabaja estrictamente por fases. Al cerrar cada una: para, resume qué
  construiste y cómo probarlo, y espera mi OK.
- TypeScript estricto (no `any` sin justificar), ESLint + Prettier, Husky,
  commits convencionales, Vitest + Playwright.
- IP: mascotas y assets 100% originales. Prohibido mascotas oficiales, escudos,
  logos, sponsors, camisetas, jugadores como marca. Banderas, nombres de países
  y ciudades sede: permitidos (arte original para estadios y mapa).
- Seguridad: API keys solo en backend/Supabase Vault. RLS en todas las tablas.
- Accesibilidad: prefers-reduced-motion, contraste AA, foco visible, ARIA.
- i18n: todas las cadenas vía i18next (es/en/pt). NADA hardcodeado.
- Latencia honesta: el vivo se diseña como "casi en vivo". Nunca prometer
  instantaneidad. Mostrar el minuto del evento, no la hora del cliente.
- Si una decisión afecta arquitectura, costo o cuota de API, pregúntame antes.
- Mantén CLAUDE.md al día y las skills en .claude/skills/.

Empieza con el paso 1.
```

-----

## §2 Visión de producto

**Concepto:** app gamificada estilo Duolingo para el Mundial 2026. Eliges tu
selección, recibes una mascota-avatar original, y la sigues por las 16 ciudades
sede reales mientras vives animaciones en tiempo real de los partidos oficiales.
Si tu mascota gana, viaja a la siguiente sede; si pierde, se va a casa.

### Bucle principal

1. **Elige** tu selección (las 48 del fixture oficial 2026).
1. **Nace tu mascota** — SVG paramétrico original, tintado con colores de la
   bandera, rasgo distintivo único. Le pones nombre; tiene humores.
1. **Mapa-viaje** — tablero geográfico de las 16 sedes. Tu mascota juega sus
   **partidos reales** (rivales, sedes y horarios oficiales). Nunca aleatorios.
1. **Pronostica el marcador** (quiniela) antes de cada partido: exacto +50 XP,
   aciertas resultado +20 XP, falla +0.
1. **Partido en vivo** ("casi en vivo"): mascota reacciona en tiempo real a
   goles, tarjetas y el final; medidor de apoyo colectivo con hinchas en vivo.
1. **Resultado**: gana → viaje animado a la siguiente sede + XP + racha.
   Pierde → regreso a casa + tarjeta de despedida + modo eliminado.
1. **Comparte**: tarjetas auto-generadas (9:16 y 1:1) por cada momento clave.

### Funcionalidades destacadas

**A. Mapa-viaje real.** El camino de cada selección son sus partidos oficiales:
3 rivales reales de su grupo (sedes/horarios del fixture) y en eliminatorias el
rival real que arroje el bracket. Nunca aleatorios.

**B. Pronóstico de marcador (quiniela).** Antes de entrar al partido en vivo el
usuario predice el marcador exacto. Sistema de puntuación: exacto +50 XP,
resultado correcto +20 XP, falla +0 XP. Se muestra el resultado del pronóstico
en la tarjeta final.

**C. Motor de apoyo físico.** El medidor de apoyo debe *sentirse* real:

- **Web Audio API**: rugido de estadio sintetizado (ruido filtrado en loop,
  ganancia controlada por el nivel de apoyo); drum thud por tap; bocina de gol
  (osciladores sawtooth). Sin assets externos. Toggle de sonido.
- **Haptics**: `navigator.vibrate` en tap (10 ms) y patrón en gol.
- **Partículas**: emojis animados al tocar, contador de combo (se resetea si
  dejas de tocar por >800 ms), ring de ripple.
- **Temperatura del ambiente**: etiquetas por umbral (Tibio / Caliente / EN
  LLAMAS / TERREMOTO) con color; el pitch se tiñe con la energía colectiva; a
  > 80% el estadio hace un subtle screen-shake.
- **Presencia en vivo**: contador de hinchas de ambos equipos que crece con los
  taps.

**D. Vista "Todos los grupos y sedes".** Pantalla accesible desde el hub que
muestra los 12 grupos con las 4 selecciones de cada uno (resaltando la del
usuario), más las 16 ciudades sede como chips. Referencia permanente al fixture
real.

**E. Modo eliminado (retención).** Cuando tu selección queda fuera: (1) "Adopta
una selección" para seguir la recta final; (2) colección de mascotas (álbum de
las 48) que se desbloquean siguiendo sus caminos.

**F. Tarjetas compartibles (motor viral).** Motor de imagen (html-to-image /
satori) para cada momento: gol, avance, despedida, duelo, hito. Formatos 9:16 y
1:1. Web Share API con fallback a descarga.

**G. Comunidad en vivo.** Realtime Presence por `match_id` para mostrar hinchas
de cada bando. Medidor de apoyo agregado server-side con decaimiento temporal y
throttle antiabuso.

### MVP vs después

**MVP:** selección + mascota + nombre/humores, mapa-viaje grupos, quiniela,
motor en vivo (animaciones + medidor de apoyo + presencia), XP/nivel/racha,
tarjetas compartibles, regreso a casa / viaje a siguiente sede, vista completa
de grupos y sedes, modo bajo consumo.

**Después:** bracket prediction, colección mascotas, adopta-selección, ligas con
amigos, push notifications, personalización de mascota, logros, tablas de
posiciones.

-----

## §3 Stack técnico

**Frontend:** React 18 + Vite + TypeScript (strict). PWA móvil-first instalable.

- Tailwind CSS (tokens en CSS variables; nunca `any` de Tailwind en runtime).
- **Motion** (Framer Motion) para UI / micro-interacciones.
- **Lottie** (`lottie-react`) para estados animados de mascotas.
- **MapLibre GL** para el mapa de sedes (o SVG estilizado artístico si se quiere
  arte 100% propio).
- **html-to-image** o **satori** para tarjetas compartibles → Web Share API.
- **Zustand** (estado global) + **TanStack Query** (datos de servidor).
- **React Router v6**.
- **i18next** + **react-i18next** (es/en/pt desde el día uno).
- **howler.js** para el audio de estadio y bocina de gol (con toggle, respeta
  silencio del sistema). Alternativa: Web Audio API pura si se quiere cero deps.
- **Vibration API** nativa para haptics.
- **Web Audio API** para el rugido de estadio sintetizado (sin assets externos).

**Backend / datos / auth / realtime:** Supabase (Postgres + Auth + Realtime +
Edge Functions con cron).

**Datos de partidos:** API de fútbol externa detrás de una capa de proveedor
intercambiable (API-Football para eventos en vivo, football-data.org como
alterno). El fixture de fase de grupos **se siembra por adelantado** desde §5
de este brief; la API solo confirma estados/resultados/eventos en vivo.

**Calidad:** ESLint + Prettier, Vitest + Playwright, Husky (lint-staged).

**Deploy:** Vercel + Supabase.

-----

## §4 Arquitectura

### 4.1 Calendario oficial (ventaja clave)

El fixture de la fase de grupos ya se conoce completamente (ver §5). Se siembra
en Supabase antes de que empiece el torneo. Las 48 selecciones, 12 grupos, 16
ciudades, 72 partidos con fechas/horas ET, la estructura del bracket de
eliminatorias.

El **camino de una selección** se deriva de sus partidos reales:

- Fase de grupos: los 3 rivales oficiales en sus sedes/horarios reales.
- Eliminatorias: el rival se resuelve desde el bracket real cuando hay
  resultados confirmados. Nunca rivales aleatorios ni inventados.

### 4.2 Motor en vivo

```
[API de fútbol]
  │ (poll cada ~15 s SOLO durante partidos en vivo)
  ▼
[Edge Function "live-poller" (cron)] ── diff idempotente ──▶ [match_events]
  │                                        (provider_event_id UNIQUE)
  ▼
[matches: estado/marcador actualizado]
  │ (Supabase Realtime emite INSERT)
  ▼
[Clientes suscritos al match_id]
  ▼
[Cola de eventos → Máquina de estados de mascota → Animación]
```

- **Diff idempotente:** cada evento con `provider_event_id` UNIQUE; se inserta
  solo lo nuevo.
- **Fan-out:** gol → INSERT en `match_events` → todos los clientes del partido.
- **Catch-up:** al entrar tarde, fetch del historial → suscripción en vivo. El
  estado refleja el marcador actual sin reproducir todo.
- **Máquina de estados:** `idle | cheer | nervous | celebrate | sad | redcard | fulltime | travel | gohome`. Eventos en cola, animados en secuencia.
- **El poller** solo corre durante ventanas con partidos en vivo (ahorro de
  cuota), activado por el calendario sembrado.

### 4.3 Mapeo evento → animación

| Evento          | Tu mascota              | Rival                   |
|-----------------|-------------------------|-------------------------|
| Gol a favor     | `celebrate` + confeti   | `sad`                   |
| Gol en contra   | `sad`                   | `celebrate`             |
| Amarilla rival  | `cheer`                 | `nervous`               |
| Roja rival      | `cheer`                 | `gohome` (si expulsado) |
| Penal           | `nervous`               | `nervous`               |
| Final (ganas)   | `celebrate` → `travel`  | `sad` → `gohome`        |
| Final (pierdes) | `sad` → `gohome`        | `celebrate` → `travel`  |

### 4.4 Medidor de apoyo (física del soporte)

```
Cliente:
  pointerdown → throttle 38 ms → support += 6.5 (cap 100)
             → combo++ (reset si >800 ms sin tap)
             → partícula + ripple + thud (Web Audio)
             → navigator.vibrate(10)

Intervalo 140 ms:
  support -= 2.0 (decaimiento)
  --team-1 glow en pitch = support / 100
  shake del pitch si support > 80
  Audio.roarGain = support / 100 * 0.25
  fansLive += cuando support > 60, -= cuando < 60
```

Límite antiabuso: throttle 38 ms en cliente + agregación server-side cada bucket
de 5 s. El valor decae con función exponencial en servidor.

### 4.5 Transiciones del torneo

Al finalizar un partido:

- **Gana** → `status = avanza`, nueva sede/ronda; cliente reproduce `travel`.
- **Pierde / eliminada** → `status = eliminada`; cliente reproduce `gohome` +
  tarjeta de despedida + modo eliminado (adopta-selección).
- **Cruce resuelto** → marca el duelo; cliente reproduce animación duelo +
  cuenta regresiva.

### 4.6 Pronóstico de marcador

```typescript
type PredScore = { pf: number; pa: number }; // desde perspectiva del usuario

function scorePrediction(pred: PredScore, result: PredScore): number {
  if (pred.pf === result.pf && pred.pa === result.pa) return 50; // exacto
  const predOutcome = Math.sign(pred.pf - pred.pa);
  const realOutcome = Math.sign(result.pf - result.pa);
  if (predOutcome === realOutcome) return 20; // resultado correcto
  return 0;
}
```

Stepper UI: [tu equipo] [−][N][+] – [−][N][+] [rival]. Min 0, max 9.
Resultado mostrado en tarjeta final.

### 4.7 Latencia honesta

Los eventos oficiales llegan con segundos de retraso. El vivo se presenta como
"casi en vivo". Se muestra el **minuto del evento** (no la hora del cliente).
Nunca se promete instantaneidad. Badge visible en la UI live.

-----

## §5 DATOS REALES 2026 — embebidos (NO buscar en internet)

> Fuente verificada: sorteo oficial 5 dic 2025 (Kennedy Center, Washington DC) +
> repechajes UEFA y Confederaciones 26/31 mar 2026.
>
> **Ganadores de repechajes confirmados:**
>
> - UEFA A → Bosnia y Herzegovina (Group B)
> - UEFA B → Suecia (Group F)
> - UEFA C → Türkiye (Group D)
> - UEFA D → Chequia (Group A)
> - Intercontinental 1 → RD Congo (Group K)
> - Intercontinental 2 → Irak (Group I)

### 5.1 Las 48 selecciones

Copia este seed como `supabase/seeds/teams.ts` (o inícialo en la migración):

```typescript
// c: [primary, secondary, tertiary] — colores de bandera para la mascota
// trait: rasgo original de la mascota (horns|ears|crest|antenna|star|round)
export const TEAMS_SEED = [
  // — GRUPO A —
  { id:"mex", name:"México",            flag:"🇲🇽", group:"A", trait:"horns",   c:["#0a8f4f","#ffffff","#d4264b"] },
  { id:"rsa", name:"Sudáfrica",         flag:"🇿🇦", group:"A", trait:"crest",   c:["#007a4d","#ffb612","#de3831"] },
  { id:"kor", name:"Corea del Sur",     flag:"🇰🇷", group:"A", trait:"antenna", c:["#1b53b3","#d4264b","#ffffff"] },
  { id:"cze", name:"Chequia",           flag:"🇨🇿", group:"A", trait:"ears",    c:["#11457e","#d7141a","#ffffff"] },
  // — GRUPO B —
  { id:"can", name:"Canadá",            flag:"🇨🇦", group:"B", trait:"star",    c:["#d4264b","#ffffff","#b0b8c4"] },
  { id:"qat", name:"Catar",             flag:"🇶🇦", group:"B", trait:"round",   c:["#8a1538","#ffffff","#6e1030"] },
  { id:"sui", name:"Suiza",             flag:"🇨🇭", group:"B", trait:"horns",   c:["#d4264b","#ffffff","#b01b35"] },
  { id:"bih", name:"Bosnia y H.",       flag:"🇧🇦", group:"B", trait:"crest",   c:["#002395","#ffd100","#ffffff"] },
  // — GRUPO C —
  { id:"bra", name:"Brasil",            flag:"🇧🇷", group:"C", trait:"star",    c:["#ffd21f","#10a05a","#1b3a8f"] },
  { id:"mar", name:"Marruecos",         flag:"🇲🇦", group:"C", trait:"ears",    c:["#c1272d","#0a8f4f","#ffffff"] },
  { id:"hai", name:"Haití",             flag:"🇭🇹", group:"C", trait:"antenna", c:["#00209f","#d21034","#ffffff"] },
  { id:"sco", name:"Escocia",           flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", group:"C", trait:"horns",   c:["#0065bf","#ffffff","#0b1f3a"] },
  // — GRUPO D —
  { id:"usa", name:"Estados Unidos",    flag:"🇺🇸", group:"D", trait:"star",    c:["#3c4a9e","#d4264b","#ffffff"] },
  { id:"par", name:"Paraguay",          flag:"🇵🇾", group:"D", trait:"crest",   c:["#d52b1e","#0038a8","#ffffff"] },
  { id:"aus", name:"Australia",         flag:"🇦🇺", group:"D", trait:"ears",    c:["#00843d","#ffcd00","#012169"] },
  { id:"tur", name:"Türkiye",           flag:"🇹🇷", group:"D", trait:"round",   c:["#e30a17","#ffffff","#b00712"] },
  // — GRUPO E —
  { id:"ger", name:"Alemania",          flag:"🇩🇪", group:"E", trait:"crest",   c:["#1c1c22","#dd0000","#ffce00"] },
  { id:"cuw", name:"Curazao",           flag:"🇨🇼", group:"E", trait:"antenna", c:["#0038a8","#f9d616","#ffffff"] },
  { id:"civ", name:"Costa de Marfil",   flag:"🇨🇮", group:"E", trait:"horns",   c:["#f77f00","#ffffff","#009e60"] },
  { id:"ecu", name:"Ecuador",           flag:"🇪🇨", group:"E", trait:"star",    c:["#ffd100","#0072ce","#ef3340"] },
  // — GRUPO F —
  { id:"ned", name:"Países Bajos",      flag:"🇳🇱", group:"F", trait:"horns",   c:["#ff6c2f","#ffffff","#21468b"] },
  { id:"jpn", name:"Japón",             flag:"🇯🇵", group:"F", trait:"antenna", c:["#1b3a8f","#ffffff","#bc002d"] },
  { id:"tun", name:"Túnez",             flag:"🇹🇳", group:"F", trait:"round",   c:["#e70013","#ffffff","#b0000f"] },
  { id:"swe", name:"Suecia",            flag:"🇸🇪", group:"F", trait:"crest",   c:["#1b53b3","#ffcd00","#0f3a86"] },
  // — GRUPO G —
  { id:"bel", name:"Bélgica",           flag:"🇧🇪", group:"G", trait:"ears",    c:["#1c1c22","#fdda24","#ef3340"] },
  { id:"egy", name:"Egipto",            flag:"🇪🇬", group:"G", trait:"crest",   c:["#ce1126","#ffffff","#1c1c22"] },
  { id:"irn", name:"Irán",              flag:"🇮🇷", group:"G", trait:"star",    c:["#239f40","#ffffff","#da0000"] },
  { id:"nzl", name:"Nueva Zelanda",     flag:"🇳🇿", group:"G", trait:"horns",   c:["#00247d","#cc142b","#ffffff"] },
  // — GRUPO H —
  { id:"esp", name:"España",            flag:"🇪🇸", group:"H", trait:"crest",   c:["#d4264b","#ffcf2e","#a01827"] },
  { id:"cpv", name:"Cabo Verde",        flag:"🇨🇻", group:"H", trait:"antenna", c:["#003893","#ffffff","#cf2027"] },
  { id:"uru", name:"Uruguay",           flag:"🇺🇾", group:"H", trait:"round",   c:["#6cb6e8","#ffffff","#fcd116"] },
  { id:"ksa", name:"Arabia Saudita",    flag:"🇸🇦", group:"H", trait:"star",    c:["#006c35","#ffffff","#02502a"] },
  // — GRUPO I —
  { id:"fra", name:"Francia",           flag:"🇫🇷", group:"I", trait:"ears",    c:["#1b3a8f","#ffffff","#d4264b"] },
  { id:"sen", name:"Senegal",           flag:"🇸🇳", group:"I", trait:"crest",   c:["#00853f","#fdef42","#e31b23"] },
  { id:"nor", name:"Noruega",           flag:"🇳🇴", group:"I", trait:"horns",   c:["#ba0c2f","#ffffff","#00205b"] },
  { id:"irq", name:"Irak",              flag:"🇮🇶", group:"I", trait:"round",   c:["#007a3d","#ffffff","#1c1c22"] },
  // — GRUPO J —
  { id:"arg", name:"Argentina",         flag:"🇦🇷", group:"J", trait:"star",    c:["#6cb6e8","#ffffff","#ffcf2e"] },
  { id:"alg", name:"Argelia",           flag:"🇩🇿", group:"J", trait:"crest",   c:["#006633","#ffffff","#d21034"] },
  { id:"aut", name:"Austria",           flag:"🇦🇹", group:"J", trait:"ears",    c:["#ed2939","#ffffff","#c41f2e"] },
  { id:"jor", name:"Jordania",          flag:"🇯🇴", group:"J", trait:"antenna", c:["#007a3d","#ffffff","#ce1126"] },
  // — GRUPO K —
  { id:"por", name:"Portugal",          flag:"🇵🇹", group:"K", trait:"horns",   c:["#006233","#d4264b","#ffd100"] },
  { id:"col", name:"Colombia",          flag:"🇨🇴", group:"K", trait:"star",    c:["#ffcf2e","#1b3a8f","#d4264b"] },
  { id:"uzb", name:"Uzbekistán",        flag:"🇺🇿", group:"K", trait:"crest",   c:["#1eb53a","#ffffff","#0099b5"] },
  { id:"cod", name:"RD Congo",          flag:"🇨🇩", group:"K", trait:"antenna", c:["#007fff","#f7d618","#ce1021"] },
  // — GRUPO L —
  { id:"eng", name:"Inglaterra",        flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", group:"L", trait:"crest",   c:["#dfe6f0","#cf142b","#00247d"] },
  { id:"cro", name:"Croacia",           flag:"🇭🇷", group:"L", trait:"ears",    c:["#e8294a","#ffffff","#1b3a8f"] },
  { id:"gha", name:"Ghana",             flag:"🇬🇭", group:"L", trait:"star",    c:["#ce1126","#fcd116","#006b3f"] },
  { id:"pan", name:"Panamá",            flag:"🇵🇦", group:"L", trait:"round",   c:["#005293","#d21034","#ffffff"] },
] as const;
```

### 5.2 Los 72 partidos de fase de grupos

Copia como `supabase/seeds/matches.ts`. Horarios en ET (UTC-4, EDT de junio).

```typescript
// h=local, a=visitante, iso=kickoff ET, city=ciudad sede, st=estadio
export const MATCHES_SEED = [
  // ── GRUPO A ──────────────────────────────────────────────────────────────
  { g:"A", h:"mex", a:"rsa", iso:"2026-06-11T15:00:00-04:00", city:"Ciudad de México", st:"Estadio Azteca" },
  { g:"A", h:"kor", a:"cze", iso:"2026-06-11T22:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  { g:"A", h:"cze", a:"rsa", iso:"2026-06-18T12:00:00-04:00", city:"Atlanta",           st:"Mercedes-Benz Stadium" },
  { g:"A", h:"mex", a:"kor", iso:"2026-06-18T21:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  { g:"A", h:"cze", a:"mex", iso:"2026-06-24T21:00:00-04:00", city:"Ciudad de México", st:"Estadio Azteca" },
  { g:"A", h:"rsa", a:"kor", iso:"2026-06-24T21:00:00-04:00", city:"Monterrey",         st:"Estadio BBVA" },
  // ── GRUPO B ──────────────────────────────────────────────────────────────
  { g:"B", h:"can", a:"bih", iso:"2026-06-12T15:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"B", h:"qat", a:"sui", iso:"2026-06-13T15:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"B", h:"sui", a:"bih", iso:"2026-06-18T15:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"B", h:"can", a:"qat", iso:"2026-06-18T18:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"B", h:"sui", a:"can", iso:"2026-06-24T15:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"B", h:"bih", a:"qat", iso:"2026-06-24T15:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  // ── GRUPO C ──────────────────────────────────────────────────────────────
  { g:"C", h:"bra", a:"mar", iso:"2026-06-13T18:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"C", h:"hai", a:"sco", iso:"2026-06-13T21:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"C", h:"sco", a:"mar", iso:"2026-06-19T18:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"C", h:"bra", a:"hai", iso:"2026-06-19T20:30:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"C", h:"sco", a:"bra", iso:"2026-06-24T18:00:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"C", h:"mar", a:"hai", iso:"2026-06-24T18:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  // ── GRUPO D ──────────────────────────────────────────────────────────────
  { g:"D", h:"usa", a:"par", iso:"2026-06-12T21:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"D", h:"aus", a:"tur", iso:"2026-06-14T00:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"D", h:"usa", a:"aus", iso:"2026-06-19T15:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  { g:"D", h:"tur", a:"par", iso:"2026-06-19T23:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"D", h:"tur", a:"usa", iso:"2026-06-25T22:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"D", h:"par", a:"aus", iso:"2026-06-25T22:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  // ── GRUPO E ──────────────────────────────────────────────────────────────
  { g:"E", h:"ger", a:"cuw", iso:"2026-06-14T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"E", h:"civ", a:"ecu", iso:"2026-06-14T19:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"E", h:"ger", a:"civ", iso:"2026-06-20T16:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"E", h:"ecu", a:"cuw", iso:"2026-06-20T20:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  { g:"E", h:"cuw", a:"civ", iso:"2026-06-25T16:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"E", h:"ecu", a:"ger", iso:"2026-06-25T16:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  // ── GRUPO F ──────────────────────────────────────────────────────────────
  { g:"F", h:"ned", a:"jpn", iso:"2026-06-14T16:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"F", h:"swe", a:"tun", iso:"2026-06-14T22:00:00-04:00", city:"Monterrey",        st:"Estadio BBVA" },
  { g:"F", h:"ned", a:"swe", iso:"2026-06-20T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"F", h:"tun", a:"jpn", iso:"2026-06-21T00:00:00-04:00", city:"Monterrey",        st:"Estadio BBVA" },
  { g:"F", h:"jpn", a:"swe", iso:"2026-06-25T19:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"F", h:"tun", a:"ned", iso:"2026-06-25T19:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  // ── GRUPO G ──────────────────────────────────────────────────────────────
  { g:"G", h:"bel", a:"egy", iso:"2026-06-15T15:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  { g:"G", h:"irn", a:"nzl", iso:"2026-06-15T21:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"G", h:"bel", a:"irn", iso:"2026-06-21T15:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"G", h:"nzl", a:"egy", iso:"2026-06-21T21:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"G", h:"egy", a:"irn", iso:"2026-06-26T23:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  { g:"G", h:"nzl", a:"bel", iso:"2026-06-26T23:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  // ── GRUPO H ──────────────────────────────────────────────────────────────
  { g:"H", h:"esp", a:"cpv", iso:"2026-06-15T12:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  { g:"H", h:"ksa", a:"uru", iso:"2026-06-15T18:00:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"H", h:"esp", a:"ksa", iso:"2026-06-21T12:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  { g:"H", h:"uru", a:"cpv", iso:"2026-06-21T18:00:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"H", h:"cpv", a:"ksa", iso:"2026-06-26T20:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"H", h:"uru", a:"esp", iso:"2026-06-26T20:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  // ── GRUPO I ──────────────────────────────────────────────────────────────
  { g:"I", h:"fra", a:"sen", iso:"2026-06-16T15:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"I", h:"irq", a:"nor", iso:"2026-06-16T18:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"I", h:"fra", a:"irq", iso:"2026-06-22T17:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"I", h:"nor", a:"sen", iso:"2026-06-22T20:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"I", h:"nor", a:"fra", iso:"2026-06-26T15:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"I", h:"sen", a:"irq", iso:"2026-06-26T15:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  // ── GRUPO J ──────────────────────────────────────────────────────────────
  { g:"J", h:"arg", a:"alg", iso:"2026-06-16T21:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  { g:"J", h:"aut", a:"jor", iso:"2026-06-17T00:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"J", h:"arg", a:"aut", iso:"2026-06-22T13:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"J", h:"jor", a:"alg", iso:"2026-06-22T23:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"J", h:"alg", a:"aut", iso:"2026-06-27T22:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  { g:"J", h:"jor", a:"arg", iso:"2026-06-27T22:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  // ── GRUPO K ──────────────────────────────────────────────────────────────
  { g:"K", h:"por", a:"cod", iso:"2026-06-17T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"K", h:"uzb", a:"col", iso:"2026-06-17T22:00:00-04:00", city:"Ciudad de México", st:"Estadio Azteca" },
  { g:"K", h:"por", a:"uzb", iso:"2026-06-23T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"K", h:"col", a:"cod", iso:"2026-06-23T22:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  { g:"K", h:"col", a:"por", iso:"2026-06-27T19:30:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"K", h:"cod", a:"uzb", iso:"2026-06-27T19:30:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  // ── GRUPO L ──────────────────────────────────────────────────────────────
  { g:"L", h:"eng", a:"cro", iso:"2026-06-17T16:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"L", h:"gha", a:"pan", iso:"2026-06-17T19:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"L", h:"eng", a:"gha", iso:"2026-06-23T16:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"L", h:"pan", a:"cro", iso:"2026-06-23T19:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"L", h:"pan", a:"eng", iso:"2026-06-27T17:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"L", h:"cro", a:"gha", iso:"2026-06-27T17:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
] as const;
```

### 5.3 Las 16 ciudades sede

```typescript
export const HOST_CITIES = [
  "Ciudad de México", "Guadalajara", "Monterrey",
  "Toronto", "Vancouver",
  "Los Ángeles", "San Francisco Bay", "Seattle",
  "Nueva York / NJ", "Boston", "Filadelfia", "Dallas",
  "Houston", "Kansas City", "Atlanta", "Miami",
] as const;
```

### 5.4 Estructura del bracket de eliminatorias

El bracket de R32 → R16 → QF → SF → Final ya está definido oficialmente. La
estructura (qué posición de grupo vs qué posición) se siembra; los rivales
concretos se completan con los resultados reales. Ver fixture oficial FIFA para
las cruces de R32. La app muestra "Rival por confirmar" hasta que los resultados
reales lleguen por la API.

-----

## §6 Sistema de diseño

**Identidad:** estadio de noche + energía vibrante. Verde césped neón `#16e07a`
y dorado de trofeo `#ffd24a` como acentos. Los colores de cada selección tiñen
la pantalla y la mascota (inyectados como CSS variables `--team-1/2/3`).

**Tipografía:** display condensada deportiva **Anton** o **Archivo Black** +
cuerpo con carácter **Outfit** o **DM Sans**. Prohibido Inter/Roboto/Arial.

**Motion:** entradas escalonadas; bob en nodo activo; pop en recompensas; alto
impacto en gol, viaje y subida de nivel. `prefers-reduced-motion` siempre.

**Mapa:** arte cálido y estilizado de Norteamérica; las 16 sedes como pines;
rutas animadas entre sedes cuando una mascota viaja. MapLibre GL o SVG artístico.

**Tarjetas compartibles:** plantillas 9:16 y 1:1 con mascota como protagonista.

**Tokens CSS:** `--night`, `--grass`, `--gold`, `--ink`, `--muted`, `--line`,
`--radius`, `--shadow`, `--team-1/2/3`, `--hype`. Tema claro y oscuro.

**Audio:** ambiente de estadio sintetizado (Web Audio, sin assets externos),
bocina de gol (osciladores sawtooth), drum thud por tap. Toggle visible. Respeta
silencio del sistema con detección de `prefers-reduced-motion`.

**Daltonismo:** nunca depender solo del color del equipo. Añadir
forma/etiqueta/icono. Verificar paletas con simuladores (Coblis, etc.).

### Mascotas — reglas de IP (críticas)

- **100% originales.** Criaturas simpáticas cuya paleta se inspira en los
  colores de la bandera, con un rasgo distintivo por equipo (ver `trait` en §5).
  SVG paramétrico + estados Lottie.
- **Prohibido:** mascotas oficiales del Mundial, escudos de federaciones, logos,
  sponsors, diseños de camiseta reales, nombres de jugadores como marca.
- **Permitido:** banderas nacionales, nombres de países y ciudades sede
  (estadios y mapa con arte original).
- **Personalidad:** nombre editable por el usuario; humores (confiada/nerviosa/
  triste/eufórica) ligados al momento de su selección; micro-animaciones idle.
- **Estados:** `idle | cheer | nervous | celebrate | sad | redcard | fulltime | travel | gohome`. Cola de estados, animados en secuencia.

-----

## §7 Modelo de datos (Supabase)

```sql
-- Tablas maestras (lectura pública)
teams         (id, name, flag_code, group_code, color_primary, color_secondary,
               color_tertiary, mascot_trait)
host_cities   (id, name, country, lat, lng)
matches       (id, provider_match_id, home_team_id, away_team_id, city_id,
               kickoff_at, round, status, score_home, score_away)
match_events  (id, match_id, provider_event_id UNIQUE, minute, type,
               team_id, payload, created_at)
team_journey  (team_id, current_round, current_city_id,
               status[in_tournament|advanced|eliminated|champion], updated_at)

-- Tablas de usuario (RLS estricta: cada quien lee/escribe lo suyo)
profiles      (id→auth.users, username, team_id, mascot_id, mascot_name,
               mascot_mood, adopted_team_id, level, xp, streak, locale,
               low_data_mode, last_active)
predictions   (id, user_id, match_id, pred_home, pred_away,
               points_awarded, resolved_at)
bracket_predictions (id, user_id, predictions jsonb, points_total)
user_progress (id, user_id, match_id, node_state)
mascot_unlocks(user_id, mascot_id, unlocked_at)
daily_checkins(user_id, day DATE, created_at)
support_meter (match_id, bucket_ts, team_id, taps)  -- agregado cada 5 s
share_cards   (id, user_id, type, match_id, created_at)
campaign_journal(id, user_id, team_id, entry_type, match_id, payload, created_at)
```

- **RLS en todo.** Las tablas maestras (`teams`, `matches`, etc.) tienen RLS de
  lectura pública. Las de usuario con `user_id = auth.uid()`.
- **`match_events.provider_event_id UNIQUE`** garantiza el diff idempotente.
- **Presencia** de hinchas en vivo: Realtime Presence por `match_id` (efímero,
  sin tabla).

-----

## §8 Calidad y guardarraíles (no negociables)

- TypeScript estricto; `noImplicitAny: true`. Sin `any` sin justificar.
- ESLint + Prettier + Husky (lint-staged). Commits convencionales.
- **Vitest** para: lógica de puntuación (quiniela), máquina de estados de
  mascota, diff de eventos, transiciones del torneo, decaimiento del apoyo.
- **Playwright** para flujos: onboarding → primer mapa, pronosticar → partido
  simulado → tarjeta, modo eliminado.
- `prefers-reduced-motion` → variante de animación reducida en CSS + JS.
- Contraste AA, foco visible, ARIA, navegación por teclado.
- Lazy-load de Lotties y del mapa; presupuesto de animación; listas
  virtualizadas; Web Vitals monitorizados.
- Secretos solo en `env` / Supabase Vault. Nunca keys en cliente.
- i18n: todas las cadenas vía i18next (es/en/pt base). Nada hardcodeado.
- Daltonismo: información nunca solo por color. Paletas verificadas.
- Modo bajo consumo: toggle que reduce animaciones, audio y peso de datos.
- Latencia honesta: el vivo es "casi en vivo". Mostrar minuto del evento,
  sin prometer instantaneidad.

-----

## §9 Skills de proyecto

Crea en `.claude/skills/<nombre>/SKILL.md` (frontmatter YAML con `name` y
`description`):

| Skill                | Propósito                                                                               |
|----------------------|-----------------------------------------------------------------------------------------|
| `add-mascot`         | Añadir una mascota: SVG paramétrico + estados Lottie + registro. Incluye reglas de IP.  |
| `supabase-migration` | Migraciones, RLS y seeds (incluye seed del fixture oficial de §5).                      |
| `live-event-mapping` | Mapear un nuevo tipo de evento del proveedor a estado de animación + cola.              |
| `journey-map`        | Convenciones de sedes, pines, rutas y animaciones travel/gohome/duelo.                  |
| `share-card`         | Plantillas de tarjetas (gol/avance/despedida/duelo/hito), formatos 9:16 y 1:1, branding.|
| `design-tokens`      | Sistema de diseño completo aplicable a todo componente nuevo.                           |
| `i18n-strings`       | Convención para añadir cadenas (claves, es/en/pt) sin texto hardcodeado.                |
| `support-engine`     | Lógica del medidor de apoyo: throttle, Web Audio, partículas, combo, decaimiento.       |
| `prediction-system`  | Sistema de pronóstico de marcador: stepper UI, scoring, persistencia.                   |

-----

## §10 Plan por fases — prompts listos para pegar

### FASE 0 — Fundaciones

```
Implementa la Fase 0: scaffold con Vite + React 18 + TypeScript (strict) +
Tailwind (tokens en CSS variables) + Motion + Zustand + TanStack Query +
React Router v6. Configura ESLint/Prettier/Husky (lint-staged), Vitest y
Playwright. Inicializa el cliente Supabase + .env de ejemplo (nunca keys reales
en repo). Configura i18next + react-i18next con es/en/pt: NADA hardcodeado.
Crea los design tokens del §6 (CSS variables, tema claro/oscuro, paletas
seguras para daltonismo). Crea los componentes base: Button, Card, Chip, Bar
(progreso), StepperInput (para la quiniela). Deja preparado el toggle de "modo
bajo consumo". Crea las skills add-mascot, i18n-strings, design-tokens y
supabase-migration. Genera el CLAUDE.md raíz con /init. Dime cómo correr y
probar. Ningún texto hardcodeado.
```

### FASE 1 — Selección + mascota + primer minuto mágico

```
Implementa la Fase 1 usando los datos de §5 del brief:
1. Pantalla de selección: las 48 selecciones agrupadas por Grupo A–L (datos del
   TEAMS_SEED). Mostrar bandera, nombre, colores de bandera como swatches.
2. Sistema de mascotas originales (SVG paramétrico + estados Lottie: idle,
   celebrate, sad, travel, gohome, cheer, nervous). Rasgo distintivo por equipo
   según el campo `trait` del seed. Cumplir reglas de IP del §6.
   Actualiza la skill add-mascot.
3. Personalidad: nombre editable, humores (confiada/nerviosa/triste/eufórica)
   como estado derivado del momento de la selección. Mensajitos antes del
   partido ("Hoy es el día 🔥").
4. "Primer minuto mágico": elegir selección → mascota nace con animación
   celebratoria → inmediatamente se ve el mapa con el PRIMER RIVAL REAL del
   fixture (Jornada 1 de su grupo según MATCHES_SEED) y su cuenta regresiva.
5. Guardar perfil en Supabase Auth + tabla `profiles` con RLS.
Tests: onboarding completo, mascota reveal, primer rival correcto según fixture.
```

### FASE 2 — Calendario real + mapa-viaje + hub de jornada

```
Implementa la Fase 2:
1. Migración Supabase con la skill supabase-migration: siembra completa de
   TEAMS_SEED, MATCHES_SEED (72 partidos con ISO 8601 ET), HOST_CITIES y la
   estructura del bracket de eliminatorias. Todo de §5 del brief.
2. Camino real de la selección: derivar los 3 partidos oficiales de su grupo
   (sedes y horarios reales del seed). En eliminatorias, el rival llega de los
   resultados reales del bracket. NUNCA rivales aleatorios.
3. Mapa-viaje: MapLibre GL (o SVG estilizado artístico) con las 16 ciudades
   sede como pines. La posición de la mascota en el mapa. Animaciones:
   - travel: viaje animado a la siguiente sede.
   - gohome: regreso a casa.
   - duelo: cuando el próximo cruce está confirmado + cuenta regresiva.
   Skill journey-map.
4. XP / niveles / racha diaria persistidos en `user_progress` y `profiles`.
5. Hub de jornada: lista de TODOS los partidos del día (del seed) con estado
   (programado/en vivo/finalizado). El mapa global evoluciona con cada resultado.
6. Check-in diario ligero (tabla `daily_checkins`) que mantiene la racha
   incluso en días sin partido propio.
7. Vista "Todos los grupos y sedes": pantalla con los 12 grupos A–L, las 4
   selecciones de cada uno (destacando la del usuario), y las 16 ciudades sede.
Tests: derivación del camino desde el fixture real, transiciones de torneo,
racha por check-in, vista completa de grupos.
```

### FASE 3 — Pronóstico de marcador + puntuación

```
Implementa la Fase 3:
1. Pantalla de pronóstico (quiniela) justo antes de entrar al partido en vivo:
   - StepperInput UI: [flag equipo] [−][N][+] – [−][N][+] [flag rival]
   - Min 0, max 9 por equipo. Valor inicial 1-0 (favorable al usuario).
   - Mostrar el partido real (nombre, sede, fecha/hora del seed).
   - Chips de scoring: "Exacto +50 XP | Resultado +20 XP | Falla +0 XP".
2. Sistema de scoring (§4.6 del brief): función pura `scorePrediction` con
   tests unitarios exhaustivos.
3. Persistir en tabla `predictions` con RLS. Resolver al finalizar el partido.
4. Mostrar resultado del pronóstico en la tarjeta compartible final.
5. Predicción de bracket pre-torneo (aprovechando grupos conocidos del seed):
   UI de bracket con los 12 grupos. Guardar en `bracket_predictions`.
   Puntuación: acierto de R32 +10, R16 +20, QF +30, SF +50, Campeón +100.
Tests: scoring exact/result/miss, stepper UI, persistencia, bracket.
```

### FASE 4 — Motor en vivo + comunidad + apoyo físico

```
Implementa la Fase 4 según §4 del brief:
1. Edge Function "live-poller" (cron): capa de proveedor intercambiable
   (API-Football / football-data.org). Poll cada ~15 s SOLO en ventanas con
   partidos en vivo (activado por el calendario del seed). Diff idempotente por
   provider_event_id UNIQUE. Insertar en match_events.
2. Fan-out Realtime: INSERT en match_events → todos los clientes del match_id.
3. Cliente: suscripción al partido, catch-up al entrar tarde (fetch historial →
   suscripción), cola de eventos → máquina de estados de mascota (§4.2).
4. Pantalla de partido en vivo: animaciones gol/tarjeta/final, scoreboard,
   feed de eventos con minuto, badge "casi en vivo".
5. MOTOR DE APOYO FÍSICO (§4.3 del brief + §2.C):
   - Web Audio sintetizado: rugido de estadio (noise filtrado, gain = apoyo/100),
     drum thud por tap, bocina de gol (sawtooth 233 + 294 Hz). Sin assets
     externos. Toggle visible.
   - Tap: throttle 38 ms, support += 6.5 (cap 100), combo++ (reset >800 ms).
   - Partículas animadas, ring ripple, combo counter flotante.
   - Haptics: navigator.vibrate(10) en tap, patrón en gol.
   - Decaimiento: support -= 2.0 cada 140 ms.
   - Visuales: el pitch se tiñe con `--hype`; screen-shake suave si support>80.
   - Etiquetas de temperatura: Tibio / Caliente / EN LLAMAS 🔥 / TERREMOTO 🌋.
   - Crowd counter que crece con los taps.
6. COMUNIDAD: Realtime Presence por match_id (hinchas de cada bando en vivo).
   Skill support-engine. Agregar taps server-side cada 5 s; decaimiento.
7. Toque social: ver mascotas de amigos en la misma sala del partido.
8. Modo "partido simulado" para probar sin gastar cuota de API.
9. Respeta prefers-reduced-motion y modo bajo consumo.
Tests: máquina de estados, diff idempotente, medidor de apoyo (throttle + decay),
presencia, partido simulado end-to-end.
```

### FASE 5 — Tarjetas compartibles + modo eliminado + narrativa

```
Implementa la Fase 5:
1. Motor de tarjetas compartibles (skill share-card):
   - html-to-image o satori para render a imagen del lado del cliente.
   - Tipos: gol, avance, despedida, duelo, hito, resultado-con-pronóstico.
   - Formatos 9:16 (story) y 1:1 (cuadrado). Mascota como protagonista.
   - Datos: mascota + marcador + minuto + ciudad + mensaje + resultado pronóstico
     + branding "MundialGo".
   - Web Share API (móvil) con fallback a descarga.
   - Registrar en tabla share_cards para analítica.
2. NARRATIVA DE CAMPAÑA: tabla campaign_journal. Un diario del recorrido
   (cada partido, avance, eliminación). Culmina en una tarjeta-resumen
   compartible sea título o eliminación. La despedida es el pico emocional.
3. MODO ELIMINADO: cuando la selección del usuario queda fuera:
   - "Adopta una selección" para seguir la recta final.
   - Colección de mascotas (mascot_unlocks) estilo álbum: desbloqueas las 48
     siguiendo sus caminos y guardando sus tarjetas. Muestra progreso (N/48).
Tests: generación de tarjetas todos los tipos, diario de campaña, álbum.
```

### FASE 6 — Social, PWA, rendimiento y QA final

```
Implementa la Fase 6:
1. Ligas con amigos: tablas de posiciones privadas (predicciones + XP).
2. Notificaciones push desde el calendario (recordatorios pre-partido y goles).
   Usar el seed de §5 para programar con precisión.
3. PWA instalable: manifest, service worker, offline básico (datos del fixture
   del seed disponibles offline).
4. Modo bajo consumo finalizado: desactiva animaciones pesadas, audio y reduce
   payload de datos. Toggle persistido en `profiles.low_data_mode`.
5. Performance: lazy-load de Lotties y MapLibre, presupuesto de animación,
   listas virtualizadas, Web Vitals (LCP < 2.5 s, CLS < 0.1).
6. QA de inclusión:
   - Cobertura completa de traducciones (es/en/pt): 0 cadenas hardcodeadas.
   - Auditoría de daltonismo (simular deuteranopia, protanopia, tritanopia).
   - Revisión de accesibilidad: contraste AA, ARIA, teclado, screen reader.
7. Revisión de seguridad: RLS en todas las tablas (test con usuario anónimo),
   secretos solo en Vault, sin keys en cliente, CSP headers.
8. Corre /code-review sobre todas las fases. Prepara deploy a Vercel +
   Supabase (variables de entorno, migraciones en CI, preview deploys).
```

-----

## §11 Plantilla CLAUDE.md (raíz del repo)

```markdown
# MundialGo

App gamificada del Mundial 2026 (estilo Duolingo). El usuario elige una
selección (datos reales del sorteo 5-dic-2025 + repechajes 31-mar-2026),
recibe una mascota original y la sigue por las 16 ciudades sede reales mientras
vive el partido en vivo. Gana → viaja; pierde → se va a casa.

## Comandos
- `npm run dev`          → Vite dev server
- `npm run test`         → Vitest (unit)
- `npm run e2e`          → Playwright (flujos)
- `npm run lint`         → ESLint + Prettier check
- `npm run build`        → Build de producción
- `npm run ship`         → lint + test + e2e + build + resumen de release

## Stack
React 18 + Vite + TypeScript (strict), Tailwind CSS (tokens CSS), Motion,
Lottie, MapLibre GL, Zustand, TanStack Query, React Router v6, i18next
(es/en/pt), howler.js / Web Audio API, Vibration API.
Backend: Supabase (Postgres + Auth + Realtime + Edge Functions).
Datos de partidos: capa de proveedor intercambiable (API-Football / football-data.org).

## Arquitectura clave
- Fixture oficial 2026 sembrado en Supabase (§5 del brief): 48 equipos,
  72 partidos de grupos con ISO 8601, 16 ciudades, estructura del bracket.
- Motor en vivo: Edge Function "live-poller" (cron, poll ~15 s en vivo) →
  diff idempotente en match_events → Realtime fan-out → cliente (cola +
  máquina de estados de mascota). Ver §4 del brief.
- Comunidad: Realtime Presence + medidor de apoyo server-side.
- Pronóstico: scorePrediction(pred, result) → exacto +50 / resultado +20 / 0.
- Datos de fútbol detrás de interfaz `FootballProvider` (intercambiable).

## Reglas
- TypeScript strict. Commits convencionales. Tests para toda la lógica.
- IP: mascotas/assets 100% originales. Prohibido: mascotas oficiales, escudos,
  logos, camisetas, sponsors, jugadores. Permitido: banderas, países, ciudades.
- Seguridad: API keys solo en backend/Supabase Vault; RLS en todas las tablas.
- Accesibilidad: prefers-reduced-motion, contraste AA, teclado, ARIA.
- i18n: todas las cadenas vía i18next (es/en/pt), nada hardcodeado.
- Latencia honesta: vivo "casi en vivo", mostrar minuto del evento.
- Daltonismo: nunca solo color para info; forma/ícono/etiqueta siempre.
- Modo bajo consumo: toggle que reduce animaciones, audio y datos.

## Estructura de carpetas
src/
  components/      # UI base (Button, Card, Chip, StepperInput…)
  features/
    onboarding/    # Selección de equipo + reveal de mascota
    map/           # Mapa-viaje, nodos, animaciones travel/gohome/duelo
    live/          # Motor en vivo, máquina de estados, medidor de apoyo
    prediction/    # Sistema de pronóstico de marcador
    share/         # Generador de tarjetas compartibles
    groups/        # Vista de todos los grupos y sedes
    eliminated/    # Modo eliminado + colección de mascotas
  mascots/         # SVG paramétrico + Lottie states + IP rules
  lib/
    supabase/      # Cliente, tipos, helpers RLS
    football/      # Capa de proveedor (FootballProvider interface)
    audio/         # AudioEngine (Web Audio sintetizado)
    i18n/          # Configuración i18next, traducciones
  store/           # Zustand stores
  types/           # TypeScript types globales
supabase/
  migrations/      # SQL migrations (incluyendo seeds del brief §5)
  functions/       # Edge Functions (live-poller, support-aggregator)
  seeds/           # teams.ts, matches.ts, host_cities.ts
.claude/
  skills/          # add-mascot, supabase-migration, live-event-mapping,
                   # journey-map, share-card, design-tokens, i18n-strings,
                   # support-engine, prediction-system
```

## Datos del fixture

Los 72 partidos de fase de grupos están en `supabase/seeds/matches.ts`.
Las 48 selecciones en `supabase/seeds/teams.ts`. NO buscar online: usar el seed.
Fuente: sorteo oficial 5-dic-2025 + repechajes 26/31-mar-2026.
```

---

*MundialGo — el fixture ya está, la arquitectura ya está, los datos ya están.*
*Solo queda construirlo. ¡A programar!*
