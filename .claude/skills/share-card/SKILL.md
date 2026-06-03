---
name: share-card
description: Tarjetas compartibles 9:16 y 1:1. Plantillas por tipo (gol/avance/despedida/duelo/hito/resultado-con-pronóstico).
---

# Tarjetas compartibles

Componente base: `src/features/share/ShareCard.tsx`. Recibe `team`, `rival`, `scoreYou`, `scoreRival`, `city`, `predResult`, `format`.

## Tipos
- **gol**: usa `goalFlash` color del equipo, headline `¡GOOOOL!`.
- **avance**: headline `¡AVANZA!`, mood `euphoric`.
- **despedida**: headline `Gracias por todo`, mood `sad`.
- **duelo**: dos mascotas enfrentadas, headline `Duelo en {city}`.
- **resultado-con-pronóstico**: muestra chip exact/correct/miss y XP.

## Para añadir tipo nuevo
1. Añadir prop `kind: ShareCardKind`.
2. Definir headline + color + mood en un mapa.
3. Capturar con `html-to-image` o `satori` (TBD en Fase 5).

## Branding
Logo `MUNDIAL{GO}` con el color primario del equipo en `GO`. Footer con ciudad y nombre de mascota.
