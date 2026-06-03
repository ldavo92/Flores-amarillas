---
name: support-engine
description: Motor de apoyo físico — tap-to-cheer con throttle, partículas, audio Web Audio, combo y decaimiento. §4.4 del brief.
---

# Motor de apoyo

Archivo: `src/features/live/LiveMatch.tsx`. Audio: `src/lib/audio.ts`.

## Fórmula del tap
```
pointerdown → throttle 38ms → support += 6.5 (cap 100)
           → combo++ (reset si >800ms sin tap)
           → partícula + ripple + thud (Web Audio)
           → navigator.vibrate(10)
```

## Bucle (140ms)
```
support -= 2.0
roarGain = support/100 * 0.35
fansYou += si support > 60 (random)
hype CSS var = support/100
shake si support > 80
```

## Temperatura
| support | etiqueta       | color       |
|---------|----------------|-------------|
| 0–24    | TIBIO          | muted gris  |
| 25–54   | CALIENTE       | gold        |
| 55–84   | EN LLAMAS 🔥   | naranja     |
| 85–100  | TERREMOTO 🌋   | rojo        |

## Anti-abuso
- Throttle 38ms en cliente.
- Agregación server-side por bucket de 5s (Fase 4 real).
- Decay exponencial server.

## Para extender (gol propio → boost)
Llamar `setSupport(v => Math.min(100, v + 20))` cuando llega evento `goal-home` para tu equipo.
