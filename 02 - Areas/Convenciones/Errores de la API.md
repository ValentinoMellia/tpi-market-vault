---
tipo: guia
estado: vigente
verificado_contra: codigo@349c8e2
actualizado: 2026-10-04
tags: [mercado, convenciones, errores, api]
---
# Errores de la API

> Todos los errores de Mercado responden `application/problem+json` con la forma `ErrorApi`. Los textos de error están en español.

## Forma de la respuesta

`ErrorApi` (`dtos/common/ErrorApi.java`): `type` (`https://tpi.utn.frc/errors/<slug>`), `title`, `status`, `detail`, `instance`, `requestId` (en el cable, `request_id`), `timestamp`, los campos antiguos `error` y `message` por compatibilidad, y `errors[]` con `FieldErrorApi {field, message}`. Lo arma `controllers/GlobalExceptionHandler.java`. El `requestId` viene de `X-Request-Id` (`RequestLogFilter`, que también carga `traceId` y `spanId` desde `traceparent`).

## Formato de cable: `snake_case`

Todos los cuerpos REST de Mercado, de éxito y de error, van en `snake_case` y también los de entrada: `spring.jackson.property-naming-strategy=SNAKE_CASE` (`src/main/resources/application.properties:17`; el archivo de pruebas lo repite porque tapa al principal). Lo introdujo el PR #76 y el PR #91 lo extendió a los errores: antes `ErrorApi` estaba fijado en `camelCase` y ahora el identificador de traza sale como `request_id`. Ejemplos: `order_id` y `sse_stream_url` en la respuesta de compra, `offer_id` e `idempotency_key` en su cuerpo, `total_elements` en la paginación. Lo que no cambia:

- Los valores de `errors[].field` siguen siendo rutas Java en `camelCase` (por ejemplo `offerId`); solo `field` y `message` son claves de ese objeto.
- Los nombres de los parámetros de consulta y de las cabeceras no se tocan (`courseIds`, `itemType`, `X-User-Id`).
- Los payloads de Kafka y del outbox usan otro `ObjectMapper` y siguen en `camelCase` ([[Eventos y Kafka]]).
- Las respuestas 401 y 403 que escribe `SecurityConfig` son un texto JSON fijo con claves de una sola palabra (`type`, `title`, `status`, `detail`, `instance`): no pasan por `ErrorApi` y no llevan `request_id` (`configs/SecurityConfig.java`).

`RestWireFormatIntegrationTest` fija el comportamiento con el contexto real de la aplicación. El frontend convierte las claves de vuelta con un interceptor (según la descripción del PR #91, que se coordinó con un PR del frontend; no verificado aquí). Ver [[Estado actual del código]].

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
