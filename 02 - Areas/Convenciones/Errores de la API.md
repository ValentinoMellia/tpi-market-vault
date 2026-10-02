---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, convenciones, errores, api]
---
# Errores de la API

> Todos los errores de Mercado responden `application/problem+json` con la forma `ErrorApi`. Los textos de error están en español.

## Forma de la respuesta

`ErrorApi` (`dtos/common/ErrorApi.java`): `type` (`https://tpi.utn.frc/errors/<slug>`), `title`, `status`, `detail`, `instance`, `requestId`, `timestamp`, los campos antiguos `error` y `message` por compatibilidad, y `errors[]` con `FieldErrorApi {field, message}`. Lo arma `controllers/GlobalExceptionHandler.java`. El `requestId` viene de `X-Request-Id` (`RequestLogFilter`, que también carga `traceId` y `spanId` desde `traceparent`).

## Slugs

| Slug | Estado HTTP | Cuándo |
|---|---|---|
| `student-not-enrolled` | 403 | El estudiante no está inscripto |
| `course-service-unavailable` | 503 | Cursos no responde |
| `professor-not-assigned` | 403 | Profesor no asignado al curso |
| `catalog-offer-not-found` | 404 | Oferta inexistente |
| `catalog-offer-inactive` | 409 | Oferta inactiva |
| `catalog-offer-out-of-stock` | 409 | Sin stock |
| `catalog-offer-expired` | 409 | Oferta vencida |
| `order-not-found` | 404 | Orden inexistente |
| `order-access-denied` | 403 | Orden de otro usuario |
| `idempotency-key-conflict` | 409 | Misma clave con otra solicitud ([[Idempotencia]]) |
| `illegal-order-state-transition` | 409 | Transición inválida ([[Orden de compra]]) |
| `validation-error` | 400 | Datos inválidos |
| `invalid-path-parameter` | 400 | Parámetro de ruta inválido |
| `missing-header` | 400 | Falta una cabecera |
| `malformed-request-body` | 400 | Cuerpo ilegible |
| `offer-update-not-allowed` | 400 | Edición no permitida |
| `access-denied` | 403 | Permisos insuficientes (`AccessDeniedException`) |
| `item-not-found` | 404 | Oferta no encontrada (`OfferNotFoundException`) |
| `offer-not-available` | 404 | Oferta no disponible (`OfferNotAvailableException`) |
| `bad-request` | 400 | `IllegalArgumentException` |
| `unexpected-error` | 500 | Error no previsto |

Los estados HTTP están verificados contra `GlobalExceptionHandler`.

## Relacionado
[[Estado actual del código]], [[Gateway e identidad]].
