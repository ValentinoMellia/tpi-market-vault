---
tipo: pregunta
estado: archivado
verificado_contra: DEC-005
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, api]
---
# Q-009 - Endpoints y prefijos

> Los nombres de rutas y la forma de enviar la clave de idempotencia diferían entre los documentos y el código. La documentación actual ya coincide con el código. **Resuelta**: se adopta el código, ver [[DEC-005 - Endpoints y prefijos según el código]].

## Qué se contradice
| Tema | Documentos anteriores | Código |
|---|---|---|
| Prefijo | `/api/v1/market` | `/api/market` (alias `/api/v1/market/offers`) |
| Crear oferta | `POST /offers` o `/courses/{id}/catalog/items` | `POST /courses/{courseId}/catalog/manage` |
| Cambio de estado | `PATCH`, `PUT` o `DELETE` | `PATCH .../status` |
| Identificador | `courseCohortId` | `courseId` |
| Clave de idempotencia | Cabecera `X-Idempotency-Key` | Campo `idempotencyKey` del cuerpo |
| SSE | Ruta variable | `GET /api/market/orders/stream/{orderId}` |

## Evidencia nueva
La documentación actualizada del equipo adopta `POST /api/market/courses/{courseId}/orders`, la clave de idempotencia en el cuerpo y el SSE en `/api/market/orders/stream/{orderId}`, igual que el código. Dato relacionado: la clave de idempotencia es **global y no por estudiante** (`repositories/OrderRepository.java`, `findByIdempotencyKey`), ver [[Estado actual del código]]. La ruta de Mercado depende además del registro en la plataforma ([[Q-016 - Puerto y registro de Mercado en la plataforma]]).

## Qué hace hoy el código
Ver tabla en [[Estado actual del código]]. El gateway deriva `/api/market/**` del id de servicio `market-service`, consistente con el código ([[Gateway e identidad]]).

## Opciones
1. **Código como contrato.** Sin cambios.
2. **Migrar a `/api/v1/market`.** Más coherente con los documentos viejos, rompe clientes.

## Recomendación
**Adoptar el código** (opción 1, adoptada); confirmar con Frontend que `courseId` es el identificador de cohorte (T3, decidida en [[DEC-013 - Reglas de la tienda]]).

## Quién decide / con qué equipo hay que hablar
Mercado y el equipo de Frontend.

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: prefijo `/api/market/...`, clave de idempotencia en el cuerpo y SSE en `/api/market/orders/stream/{orderId}`. Ver [[DEC-005 - Endpoints y prefijos según el código]]. Pregunta archivada.
