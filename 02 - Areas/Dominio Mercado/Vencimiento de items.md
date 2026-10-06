---
tipo: entidad
estado: vigente
verificado_contra: DEC-012
actualizado: 2026-10-05
tags: [mercado, dominio, vencimiento]
---
# Vencimiento de items

> Los ítems del inventario **no vencen** ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]). Lo que sí vence es la publicación de una [[Oferta de catálogo]] (`publicationExpiresAt`). El campo `itemValidityDays` es un residuo que se debe quitar del código.

## Qué representa
Esta nota distingue dos vencimientos que se confundían:

| Vencimiento | Estado |
|---|---|
| De la **oferta** (`publicationExpiresAt`) | Vigente: hasta cuándo se publica la oferta; **puede extenderse** ([[DEC-013 - Reglas de la tienda]]), el snapshot `7528610` todavía no permitía fijarlo ni extenderlo por la API |
| Del **ítem** en el inventario | **Descartado**: ningún ítem vence |

La intención original era una regla opcional por oferta (fecha fija o 1 a 180 días desde la recepción), con aviso 24 horas antes y consulta de vencidos. Quedó descartada.

## Datos principales
| Campo | Significado |
|---|---|
| `publicationExpiresAt` | Vencimiento de la publicación de la oferta |
| `itemValidityDays` | Residuo: la función entró en el PR #44 y se revirtió en el PR #60; el campo se guarda pero **nunca se envía a accounting**. Se quita ([[Roadmap de trabajo]]) |

## Reglas de negocio
- Los ítems en el inventario nunca vencen. Accounting, dueño del inventario, no modela vencimiento ([[Integración con Accounting]], [[DEC-001 - Accounting es dueño del inventario]]).
- Las vidas tampoco vencen.

## Dónde vive en el código
`entities/CourseCatalogOfferEntity.java` (`itemValidityDays`, a quitar).

## Relacionado
[[Épica 770 - Vencimiento de items]] (descartada), [[Oferta de catálogo]].

## Propuesta de publicación — 2026-10-05

US-5207 propone fecha futura o TTL excluyentes al publicar; al editar, omisión/`null` no cambia la fecha y admite la primera futura cuando no existía vencimiento. La extensión estrictamente posterior sigue provisional, pendiente de ratificación ([[DEC-013 - Reglas de la tienda]]). [PR #113 de tpi-market](https://github.com/2026-P4-BE/tpi-market/pull/113) (fuente original `669ba7d0`) no está integrado en `develop`; véase [[Estado actual del código]]. Esto no modifica la decisión de que los ítems comprados no vencen.
