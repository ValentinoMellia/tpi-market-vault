---
tipo: guia
estado: vigente
verificado_contra: codigo@80a6aeac, codigo@e63dcb47, codigo@5fb82d80
actualizado: 2026-10-26
tags: [mercado, convenciones, errores, api]
---
# Errores de la API

> Todos los errores de Mercado responden `application/problem+json` con la forma `ErrorApi`. Los textos de error están en español.

## Forma de la respuesta

`ErrorApi` (`dtos/common/ErrorApi.java`): `type` (`https://tpi.utn.frc/errors/<slug>`), `title`, `status`, `detail`, `instance`, `requestId` (en el cable, `request_id`), `timestamp`, los campos antiguos `error` y `message` por compatibilidad, y `errors[]` con `FieldErrorApi {field, message}`. Lo arma `controllers/GlobalExceptionHandler.java`. El `requestId` viene de `X-Request-Id` (`RequestLogFilter`, que también carga `traceId` y `spanId` desde `traceparent`).

## Formato de cable: `snake_case`

Todos los cuerpos REST de Mercado, de éxito y de error, van en `snake_case` y también los de entrada: cada campo de varias palabras declara su `@JsonProperty("snake_case")` explícito; en `develop@e63dcb47` ya no hay `spring.jackson.property-naming-strategy` en `application.properties` y el `AGENTS.md` de `tpi-market` la prohíbe, igual que `@JsonNaming`. `SnakeCaseContractTest` (`src/test/java/ar/edu/utn/frc/tup/p4/dtos/SnakeCaseContractTest.java`) lo verifica por paquete de DTO. El `snake_case` lo introdujo el PR #76, con la estrategia global que después se reemplazó y el PR #91 lo extendió a los errores: antes `ErrorApi` estaba fijado en `camelCase` y ahora el identificador de traza sale como `request_id`. Ejemplos: `order_id` y `sse_stream_url` en la respuesta de compra, `offer_id` e `idempotency_key` en su cuerpo, `total_elements` en la paginación. Lo que no cambia:

- Los valores de `errors[].field` de Bean Validation y de Jackson siguen siendo rutas Java en `camelCase` (por ejemplo `offerId`, `coinPrice`, `purchaseLimit.period`), porque `controllers/FieldErrorMapper.java` usa la ruta de la propiedad. Los errores de negocio de las metas y de los cofres, en cambio, informan el nombre del cable (`target_amount`, `rarity_weights`, `prizes[0].source_offer_id`). La mezcla está abierta en [[Q-033 - Nombres de campo en los errores de validación]].
- Los nombres de los parámetros de consulta y de las cabeceras no se tocan (`courseIds`, `itemType`, `X-User-Id`).
- Los payloads de Kafka y del outbox usan otro `ObjectMapper`; para el flujo de compras migraron a `snake_case` según `contratos-kafka v8` (mergeado en `develop@d3b7a4de` vía PR #186; ver [[Eventos y Kafka]] y [[DEC-025 - Saga de compra de ítems según la Propuesta C]]).
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
| `chest-invalid-parameters` | 400 | Reglas de negocio de un [[Cofre]]: todos los errores juntos en `errors[]` (`ChestInvalidParametersException`) |
| `chest-not-found` | 404 | Cofre inexistente, de otro curso o descartado (`ChestNotFoundException`) |
| `chest-state-conflict` | 409 | Operación no permitida en el estado del cofre, o cambio de pesos o premios en un cofre publicado o desactivado; trae el campo en `errors[]` cuando lo hay (`ChestStateConflictException`) |
| `chest-version-conflict` | 409 | La `version` enviada está vieja (trae `params.currentVersion`) o otra escritura ganó la carrera (sin `currentVersion`) (`ChestVersionConflictException`) |
| `chest-limit-reached` | 422 | Compra de un cofre con el límite del período agotado; `error` lleva `MARKET_CHEST_LIMIT_REACHED` y `params` `chestId`, `maxPerStudent` y `period`. No se crea la orden ni el hold (`ChestLimitReachedException`, desde la US-12004) |
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

## Errores de los cofres

Desde la US-12002 ([[S3-02 - Cofres, el profesor crea y gestiona]]), la gestión de cofres tiene cuatro problemas propios (tabla de arriba). Lo particular:

- **Todos juntos.** `chest-invalid-parameters` junta en un solo 400 los errores de `ChestRules`, `ChestPrizeResolver` y `ChestEvaluator`, uno por campo. Los errores estructurales salen antes, como `validation-error`, porque el controlador valida con `@Valid`.
- **Lectura estricta.** En los DTO de pedido de cofres, un campo desconocido o un entero no exacto (`7.9`) responden 400 (`StrictJsonModule`).
- **`currentVersion` va en `params`**, no como campo raíz. Solo viene cuando la versión enviada estaba vieja. Si la escritura perdió una carrera, el 409 sale sin `params`.
- **Campos en `snake_case`.** Los errores de negocio usan el nombre del cable (`prizes[i].reward_kind`, `rarity_weights`, `version`, `page`). Los ejemplos de OpenAPI de cofres todavía los muestran en `camelCase` ([[Estado actual del código]], gap 26).
- **Compra de un cofre** (US-12004, [[S3-04 - Cofres, el alumno compra un cofre]]): reusa los errores de la compra directa y suma `chest-limit-reached` (422, como el tope de vidas). Un cofre que no se puede comprar responde `chest-not-found` (404) por cualquier motivo, incluido no tener nada que sortear. Un premio boost TTL con el flag apagado responde `ttl-boost-unavailable` (409) antes de sortear. Cancelar una orden de cofre en `ITEM_PROVISION_REQUESTED` responde `order-not-cancellable` (409, [[DEC-047 - Cuándo ve el alumno el premio de un cofre]]).

## Relacionado
[[Estado actual del código]], [[Gateway e identidad]], [[Cofre]], [[Q-033 - Nombres de campo en los errores de validación]].
