---
name: design-tokens
description: Sistema de diseño MundialGo. CSS variables, tipografía, animaciones base y daltonismo.
---

# Design tokens

Archivo: `src/styles/tokens.css`. Sincronizado con `tailwind.config.js`.

## Variables clave
- `--night`, `--night-2`: fondo de estadio.
- `--grass`: verde césped neón identitario.
- `--gold`: dorado de trofeo.
- `--ink`, `--muted`: textos.
- `--team-1/2/3`: colores del equipo activo (inyectados runtime).
- `--hype`: 0–1, controla glow del pitch y screen-shake.

## Tipografía
- Display: **Anton** (mayúsculas, condensada deportiva).
- Cuerpo: **Outfit**. Prohibido Inter/Roboto/Arial.

## Reglas
- Contraste AA en todo texto. Usar `text-ink` / `text-muted`.
- `prefers-reduced-motion`: variantes reducidas (ya gestionado en CSS global).
- Daltonismo: nunca depender solo del color. Añadir icono/etiqueta/forma.

## Para nuevo componente
1. Usar siempre `var(--team-N)` para acentos del equipo (no hardcodear hex).
2. Usar `Card`/`Button`/`Chip`/`Bar`/`StepperInput` antes de crear UI nuevo.
3. Animar entradas con `motion` (delay escalonado 0.05–0.1 s).
