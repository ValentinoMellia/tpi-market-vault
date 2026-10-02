---
tipo: pregunta
estado: archivado
verificado_contra: DEC-004
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, orden]
---
# Q-005 - Estados de la orden

> Los documentos anteriores describían cinco máquinas de estados distintas para la orden; el código tiene una. La documentación actual ya coincide con el código. **Resuelta**: se adopta el código, ver [[DEC-004 - Máquina de estados de la orden según el código]].

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Estados en español | `CREADA` y siguientes | Contexto de Sprint 1 |
| Aprovisionamiento y compensación | `PROVISIONING_ITEM`, `DEBIT_REQUESTED`, `COMPENSATING` | Diagramas |
| Fondos reservados | `FUNDS_RESERVED`, `ITEM_ACCREDITED`, `COMPENSATED_FAILED` | Documento de flujo |
| Compensación pendiente | `PENDING_COMPENSATION` | Historia #143 |

## Evidencia nueva
La documentación actualizada del equipo está alineada con el código: `POST /api/market/courses/{courseId}/orders`, clave de idempotencia en el cuerpo y SSE en `/api/market/orders/stream/{orderId}`. Si el orden de la saga cambia ([[Q-008 - Orden de la saga de compra]]), la máquina de estados cambiará también.

## Qué hace hoy el código
Una sola máquina en `OrderStatus` con transiciones forzadas por `OrderEntity.transitionTo/cancel`. Ver [[Orden de compra]].

## Opciones
1. **Adoptar la del código.** Sin trabajo extra.
2. **Adoptar otra.** Implica refactor y reescribir pruebas.

## Recomendación
**Adoptar el código** (opción 1, adoptada) y ajustar la historia #143 ([[Épica 137 - Compra directa]]).

## Quién decide / con qué equipo hay que hablar
Equipo de Mercado.

## Resolución
Cerrada el 2026-10-01: el líder del equipo de Mercado confirmó la máquina de estados del código. Ver [[DEC-004 - Máquina de estados de la orden según el código]]. Pregunta archivada.
