---
tipo: pregunta
estado: archivado
verificado_contra: DEC-013
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, tienda, stock]
---
# Q-015 - Reglas de la tienda

> Cinco reglas de la tienda recomendadas por el taller del equipo (T1, T3, T4, T5 y T6) que corrigen defectos reales del código. **Resuelta**: ver [[DEC-013 - Reglas de la tienda]] (T6 modificada).

## Qué se contradice
| ID | Recomendación del taller | Qué hace hoy el código |
|---|---|---|
| T1 | Incrementar `unitsSold` al confirmar la compra; disponible = total - vendidos - reservados | `unitsSold` nunca se incrementa; al editar `totalStock` se calcula `availableStock = total - unitsSold` y como `unitsSold` es 0 se devuelven al stock las unidades ya vendidas: **posible sobreventa** (`services/impl/CourseCatalogManageServiceImpl.java`) |
| T3 | `courseId` identifica la cohorte | Se usa `courseId`; los documentos viejos decían `courseCohortId` ([[Q-009 - Endpoints y prefijos]]) |
| T4 | Desactivar una oferta alcanza; no hace falta borrado lógico | Existen `active` y `deleted` en la oferta |
| T5 | Validar plantilla, tipo y multiplicador al publicar | Hay validación de configuración (`validation/ValidOfferConfigurationValidator.java`); falta cubrir plantilla y multiplicador de punta a punta |
| T6 | El vencimiento de la publicación no se extiende: se publica una oferta nueva | El detalle de una oferta vencida pero activa responde 200 (según la documentación del equipo, sin verificar) |

## Defectos relacionados (según la documentación del equipo, sin verificar en código)
- Una cancelación por `HOLD_NOT_SETTLED` no libera el stock.
- Una orden que queda en `CREATED` porque falló `requestHold` nunca se reconcilia.

Ver [[Estado actual del código]] para los gaps que sí se verificaron.

## Recomendación
Adoptar T1 a T6 (cierran defectos y simplifican). T1 es la más urgente por el riesgo de sobreventa. Se adoptaron T1, T3, T4 y T5; T6 se modificó. Ver [[Oferta de catálogo]] y [[Taller de decisiones]].

## Quién decide / con qué equipo hay que hablar
Equipo de Mercado (y Frontend para T3).

## Resolución
Cerrada el 2026-10-01 por el usuario: se aprueban T1, T3, T4 y T5; T6 se modifica (la publicación sí puede extenderse). Ver [[DEC-013 - Reglas de la tienda]]. Pregunta archivada.

Estado de implementación: la extensión de `publicationExpiresAt` está **pendiente de implementar**. Hoy `CatalogOfferPublishDto` y `CatalogOfferUpdateDto` no lo aceptan, así que el profesor no puede fijarlo ni extenderlo por la API. Se planifica en el Sprint 2 ([[Roadmap de trabajo]]).
