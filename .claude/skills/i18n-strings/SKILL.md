---
name: i18n-strings
description: Convención para añadir cadenas localizables (es/en/pt) sin texto hardcodeado.
---

# i18n

Stack: `i18next` + `react-i18next` ya instalado.

## Estructura (a implementar Fase 0 final)
```
src/lib/i18n/
  index.ts        # init con detectores
  locales/
    es.json
    en.json
    pt.json
```

## Convenciones de claves
- Espacios de nombres: `onboarding.*`, `hub.*`, `live.*`, `predict.*`, `result.*`, `groups.*`, `album.*`, `common.*`.
- Una clave por propósito, no por componente.
- Plurales con sintaxis ICU (`{{count}}`).
- Interpolación: `{{teamName}}`, `{{mascotName}}`.

## Auditoría
- Antes de PR: `grep -rE "(?<!t\\()'[A-ZÁ-Ú]" src/` y traducir hallazgos.
- Tests playwright cambiando `lng` confirman cobertura.
