---
name: prediction-system
description: Sistema de pronóstico de marcador — StepperInput, scoring puro (exacto +50, resultado +20, falla 0), persistencia.
---

# Pronóstico de marcador

UI: `src/features/prediction/Predict.tsx`.
Lógica: `scorePrediction` en `src/store/useGameStore.ts`.

## Función pura
```typescript
function scorePrediction(pred: {ph,pa}, real: {ph,pa}): number {
  if (pred.ph === real.ph && pred.pa === real.pa) return 50; // exacto
  if (Math.sign(pred.ph - pred.pa) === Math.sign(real.ph - real.pa)) return 20;
  return 0;
}
```

## StepperInput
Reusable: min 0, max 9. Anima en cambio. Color del equipo.

## Persistencia
`useGameStore.predictions[matchKey] = { ph, pa, points? }`. Resolver al final del partido con `resolvePrediction(matchKey, points)`.

## Bracket pre-torneo (Fase 3 full)
Tabla aparte `bracket_predictions`. Puntos: R32 +10, R16 +20, QF +30, SF +50, Campeón +100.

## Tests obligatorios
- Exacto 2-1 vs 2-1 → 50.
- Resultado 3-1 vs 1-0 (ambos victoria local) → 20.
- Fallido 1-2 vs 3-0 → 0.
- Empate exacto 0-0 vs 0-0 → 50.
- Empate diferente 1-1 vs 0-0 → 20 (mismo signo 0).
