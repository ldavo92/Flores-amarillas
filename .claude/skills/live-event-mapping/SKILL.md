---
name: live-event-mapping
description: Mapear un tipo de evento del proveedor (API-Football, football-data.org) a estado de mascota y animación. Mantener la cola idempotente.
---

# Mapeo evento → animación de mascota

Tabla canónica (§4.3 del brief):

| Evento provider | Mascota propia    | Mascota rival       |
|-----------------|-------------------|---------------------|
| goal (a favor)  | euphoric + confetti | sad               |
| goal (en contra)| sad               | euphoric            |
| yellow rival    | confident         | nervous             |
| red rival       | confident         | sad (si expulsado)  |
| penalty         | nervous           | nervous             |
| full-time win   | euphoric → travel | sad → gohome        |
| full-time loss  | sad → gohome      | euphoric → travel   |

## Para añadir un evento nuevo
1. Añade el literal al tipo `EventType` en `src/features/live/LiveMatch.tsx`.
2. Agrega el manejador en `pushEvent()` (estado, sonido, partícula).
3. Define la transición de humor en la tabla.
4. Cubrir con test en `vitest` (cola de eventos).
