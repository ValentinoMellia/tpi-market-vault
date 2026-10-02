---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, decision, api, endpoints]
---
# DEC-005 - Endpoints y prefijos según el código

> El contrato HTTP de Mercado es el del código: prefijo `/api/market/...`, clave de idempotencia en el cuerpo y SSE en `/api/market/orders/stream/{orderId}`.

## Contexto
Los documentos anteriores usaban `/api/v1/market`, otras rutas para crear y cambiar de estado ofertas, `courseCohortId` y una cabecera `X-Idempotency-Key`. Pregunta de origen: [[Q-009 - Endpoints y prefijos]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01:

| Tema | Contrato |
|---|---|
| Prefijo | `/api/market/...` (alias existente `/api/v1/market/offers` para el detalle de oferta) |
| Compra | `POST /api/market/courses/{courseId}/orders` con cuerpo `{offerId, idempotencyKey}` |
| Idempotencia | Campo `idempotencyKey` **en el cuerpo**, no en cabecera |
| SSE de la orden | `GET /api/market/orders/stream/{orderId}` |
| Crear oferta | `POST /courses/{courseId}/catalog/manage` |
| Cambiar estado | `PATCH .../status` |
| Identificador del curso | `courseId` |

La tabla completa de rutas está en [[Estado actual del código]].

## Alternativas descartadas
- **Migrar a `/api/v1/market`**: más coherente con los documentos viejos, pero rompe clientes y no aporta nada al código vigente.
- **Clave de idempotencia por cabecera `X-Idempotency-Key`**: el código y la documentación actual del equipo usan el cuerpo.

## Consecuencias
- No hay cambios de rutas. El gateway deriva `/api/market/**` del id `market-service` ([[Gateway e identidad]]).
- Siguen abiertos asuntos vecinos que esta decisión no cubre: que la clave de idempotencia es global y no por estudiante (gap 13 de [[Estado actual del código]]), que `courseId` sea la cohorte (decidido en [[DEC-013 - Reglas de la tienda]], T3) y el puerto y registro en la plataforma (resuelto como hecho verificado en [[Q-016 - Puerto y registro de Mercado en la plataforma]]).
- Hay que informar a Frontend del contrato vigente.

## Notas afectadas
[[Estado actual del código]], [[Gateway e identidad]], [[Idempotencia]], [[Épica 090 - Catálogo por plantillas]], [[Taller de decisiones]], [[Decisiones - Índice]].
