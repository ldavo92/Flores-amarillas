---
name: add-mascot
description: Crear/modificar la mascota paramétrica de un equipo. Lee los colores y el `trait` del seed §5.1 y dibuja un SVG 100% original con estados de humor.
---

# Cómo crear o ajustar una mascota

La mascota vive en `src/mascots/Mascot.tsx`. Es un SVG paramétrico:
- Cuerpo coloreado con `team.c[0]` y acentos con `team.c[1]`.
- Ojos en `team.c[2]`.
- Rasgo distintivo controlado por `team.trait`: `horns | ears | crest | antenna | star | round`.
- Estados (humor): `idle | confident | nervous | sad | euphoric` definidos en `useGameStore`.

## Reglas de IP (críticas)
- 100% originales. NUNCA imitar la mascota oficial del Mundial.
- Prohibido: escudos de federación, logos, sponsors, camisetas reales, jugadores.
- Permitido: banderas nacionales, nombres de países, ciudades sede.

## Para añadir un rasgo nuevo
1. Añade el literal al tipo `MascotTrait` en `src/data/teams.ts`.
2. Asigna el rasgo al equipo correspondiente del seed.
3. Añade el bloque visual condicional dentro de `<Mascot>` (debajo de los rasgos existentes).
4. Verifica con `npm run dev` que la mascota se ve bien en `idle` y `euphoric`.

## Para ajustar el humor visual
- Edita `mood` props handlers en `Mascot.tsx`. Mantén:
  - boca curvada hacia arriba en `euphoric`.
  - lágrima visible en `sad`.
  - shake horizontal en `nervous`.
