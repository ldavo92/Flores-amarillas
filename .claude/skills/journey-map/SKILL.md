---
name: journey-map
description: Convenciones del mapa-viaje. Posición de sedes, líneas entre partidos y animaciones travel/gohome/duelo.
---

# Mapa-viaje

Componente: `src/features/map/JourneyMap.tsx`.
Datos: las 16 sedes con coordenadas normalizadas (`nx`, `ny`) en `src/data/cities.ts`.

## Estados visuales
- **isPast**: nodo dorado `var(--team-2)`.
- **isCurrent**: nodo color del equipo + pulse halo.
- **isOnRoute (future)**: nodo blanco semitransparente.
- **off-route**: nodo gris.

## Animaciones a añadir
- `travel`: línea dibujada con `pathLength` 0→1 cuando la mascota viaja.
- `gohome`: mascota cae hasta la sede inicial; opacidad de la ruta a 0.4.
- `duelo`: pulse rojo al rival próximo con cuenta regresiva flotante.

## Para nueva sede (no debería pasar, ya son las 16)
Añadir a `HOST_CITIES` con lat/lng reales **y** `nx`/`ny` normalizados (0–1) para el SVG.
