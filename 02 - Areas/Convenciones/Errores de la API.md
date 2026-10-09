---
tipo: guia
estado: vigente
verificado_contra: codigo@80a6aeac
actualizado: 2026-10-09
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
| `course-closed` | 403 | El curso está cerrado (`CourseClosedException`) |
| `course-service-unavailable` | 503 | Cursos no responde |
| `accounting-service-unavailable` | 503 | No se pudieron leer las vidas del estudiante en Accounting (`AccountingServiceUnavailableException`) |
| `life-cap-reached` | 422 | La compra de vidas superaría el tope; `error` lleva `LIFE_CAP_REACHED` (`LifeCapReachedException`) |
| `professor-not-assigned` | 403 | Profesor no asignado al curso |
| `catalog-offer-not-found` | 404 | Oferta inexistente |
| `catalog-offer-inactive` | 409 | Oferta inactiva |
| `catalog-offer-out-of-stock` | 409 | Sin stock |
| `catalog-offer-expired` | 409 | Oferta vencida: en la compra y, para el alumno, en el detalle de la oferta (desde el PR #134) |
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
| `method-not-allowed` | 405 | La ruta existe pero no para ese método; la respuesta lleva `Allow` |
| `unsupported-media-type` | 415 | El `Content-Type` del cuerpo no es uno que el endpoint acepte; la respuesta lleva `Accept` |
| `route-not-found` | 404 | Ninguna ruta coincide, incluida una conocida con `/` al final |
| `not-acceptable` | 406 | El `Accept` de la solicitud excluye JSON |
| `unexpected-error` | 500 | Error no previsto |

Los estados HTTP están verificados contra `GlobalExceptionHandler`.

## Errores que Spring rechaza antes del controller

Hasta el PR #133 de `tpi-market` (US-5219 T03, [[S2-05 - Robustez de la compra]]), un verbo equivocado, un cuerpo que no es JSON, una ruta inexistente o un `Accept` que excluye JSON caían en el catch-all `@ExceptionHandler(Exception.class)` y respondían `500 unexpected-error`: el advice no extiende `ResponseEntityExceptionHandler`. Desde ese PR tienen un handler cada uno y responden 405, 415, 404 y 406 con `problem+json`. Cómo quedan:

- **Slugs.** `route-not-found` y `method-not-allowed` son los mismos del catálogo de errores del Gateway ([[Gateway e identidad]]), así el frontend recibe el mismo `type` venga el error del Gateway o de Mercado. `not-acceptable` y `unsupported-media-type` son propios.
- **Headers.** Las cuatro excepciones implementan `ErrorResponse` de Spring y los handlers copian sus `getHeaders()`: `Allow` en el 405 y `Accept` en el 415 (RFC 9110). El `Content-Type` se fija después, así que siempre queda `application/problem+json`.
- **`detail`.** No repite nada de lo que mandó el cliente: el 405 lista los métodos admitidos y el 415 los tipos admitidos. El 404 no repite la ruta, que ya va en `instance`.
- **`produces` en los endpoints que modifican estado.** Sin `produces`, Spring recién detecta el 406 al escribir la respuesta, después de ejecutar el controller: un `POST /api/market/courses/{courseId}/orders` válido con `Accept: application/xml` creaba la orden y reservaba stock, y después respondía 406. Por eso los 8 endpoints que modifican estado declaran `produces = MediaType.APPLICATION_JSON_VALUE` (compra, publicación y edición de oferta, los dos cambios de estado de oferta y los tres endpoints dev), y el 406 se decide antes del controller. Los GET no lo declaran: su 406 llega tarde pero no tiene efecto. El `swagger.json` no cambió.
- **Lo que sigue en 500.** `ServiceTokenUnavailableException` (falta el token S2S con los clientes reales) y los `IllegalStateException` de invariantes internas. El primero sería un 503; sin tarea todavía.
- **Prueba.** `src/test/java/ar/edu/utn/frc/tup/p4/acceptance/ClientErrorAcceptanceTest.java`, con el servidor real: los ocho pedidos del inventario y dos compras válidas rechazadas (415 y 406) que no crean orden ni mueven el stock.

## Relacionado
[[Estado actual del código]], [[Gateway e identidad]].
