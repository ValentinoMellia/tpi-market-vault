---
tipo: estado
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-04
tags: [mercado, codigo, estado]
---
# Estado actual del código

> Qué hace hoy `tpi-market` (rama `develop`, commit `7528610`, PR #73). El código es la segunda fuente de verdad: lo que dice acá es lo que *es*, no necesariamente lo que *debe ser*.

Actualización: `develop` avanzó a `cf988d2`, dos commits por encima de `7528610`, que solo tocan CI (la verificación del nombre de rama corre únicamente al abrir el PR); el resto de la nota sigue vigente contra `7528610`.

## Stack

Java 21, Spring Boot 4.0.0, Spring Cloud 2025.1.0 (cliente Eureka), Spring Web, Data JPA, Validation, Actuator, Security, Micrometer Tracing (OTel), springdoc 3.0.1, ModelMapper, Lombok y spring-kafka. Base H2 en desarrollo y pruebas, PostgreSQL en docker y producción. No hay Flyway ni Liquibase: el esquema lo crea Hibernate (`ddl-auto`: `create-drop` en dev, `update` en docker/prod). No hay validación de JWT en el servicio.

## Cómo correrlo

| Escenario | Cómo |
|---|---|
| Local | Perfil `dev` por defecto: H2 en memoria, Eureka deshabilitado, `market.messaging.transport=mock`, puerto 8084 (actuator 8085), Swagger en `/swagger-ui.html` |
| Docker | `mvn clean package -DskipTests` antes, porque el `Dockerfile` copia el jar ya construido. `.compose/docker-compose.yml` levanta un sidecar Tailscale (`mesh-client`), `postgres:16` (`market-db`) y la app (`network_mode: service:mesh-client`) |
| Plataforma | `.tpi/platform/` trae la plantilla del equipo docente (compose, `up.sh`, `verify.sh`), con `SPRING_PROFILES_ACTIVE=prod` y `KAFKA_SERVERS` |

El puerto local (8084, gestión 8085) es solo el valor por defecto de desarrollo (`server.port=${SERVER_PORT:8084}`). En la plataforma Mercado corre en el **8100** (gestión 8101): `.tpi/platform/docker-compose.yml` define `SERVER_PORT=${PORT}` desde `.env`, que debe tener `PORT=8100`. Verificado en [[Q-016 - Puerto y registro de Mercado en la plataforma]]; ver también [[Mapa de servicios]].

## Arquitectura

Paquete base `ar.edu.utn.frc.tup.p4`, en capas clásicas (no hexagonal): `controllers`, `services` (+`impl`), `repositories`, `entities`, `models/enums`, `dtos/*`, `mappers`, `exceptions`, `clients` (+`impl`), `listeners`, `job`, `configs`, `validation`. Los mappers son `@Component` escritos a mano. DTOs HTTP con Lombok; `record` para saga, banco, inventario y eventos; tipos sellados para resultados (`BankHoldResultDto`, `BankHoldConfirmResultDto`, `ItemProvisionResultDto`). `OrderEntity` usa `@Version` ([[Bloqueo optimista]]). Javadoc obligatorio, mensajes de error en español, código en inglés.

## Endpoints (prefijo `/api/market`)

| Método y ruta | Controlador | Roles | Qué hace |
|---|---|---|---|
| `GET /templates` | `BaseTemplateController` | PROFESSOR, ADMIN, GESTOR | Lista plantillas activas ([[Plantilla base]]) |
| `GET /courses/{courseId}/catalog` (`?itemType`) | `StorefrontCatalogController` | STUDENT, ADMIN, GESTOR, MS | Vitrina; verifica inscripción; ofertas publicadas (activas y no vencidas) |
| `GET /courses/{courseId}/catalog/{itemId}` | ídem | ídem | Detalle de oferta en el curso |
| `GET /offers/{id}` (alias `/api/v1/market/offers`) | `CatalogOfferController` | STUDENT, PROFESSOR, ADMIN, GESTOR, MS | Detalle; chequea inscripción o asignación |
| `PATCH /offers/{id}/status` | ídem | ADMIN, GESTOR, MS | Activa o desactiva (no el profesor) |
| `GET /courses/{courseId}/catalog/manage` | `CourseCatalogManageController` | PROFESSOR, ADMIN, GESTOR | Lista de gestión (usa `CourseInstructorClient`) |
| `POST /courses/{courseId}/catalog/manage` | ídem | ídem | Publica oferta (201) |
| `PATCH /courses/{courseId}/catalog/manage/{offerId}` | ídem | ídem | Edita nombre, descripción, precio, stock, activa |
| `PATCH /courses/{courseId}/catalog/manage/offers/{itemId}/status` | ídem | PROFESSOR, ADMIN, GESTOR, MS | Cambia estado |
| `POST /courses/{courseId}/orders` | `PurchaseOrderController` | STUDENT, ADMIN, GESTOR, MS | Cuerpo `{offerId, idempotencyKey}`; responde 202 `{orderId, status: "PROCESSING", sseStreamUrl}`; requiere `X-User-Id` |
| `GET /orders/stream/{orderId}` | ídem | | SSE: envía un evento de estado y cierra ([[SSE]]) |
| `GET /orders?courseId&page&size` | `StudentOrderController` | STUDENT | Órdenes propias paginadas |
| `GET /orders/{orderId}` | ídem | STUDENT | Orden propia (ajena responde 404) |
| `GET /public/ping`, `/whoami`, `/internal`, `/jwks-status` | `GatewayDiagnosticsController`, `JwksStatusController` | variable | Diagnóstico de identidad; `/internal` exige `ROLE_MS` y `market.catalog.read` |

No existen `admin/metrics` ni `/api/v1/market/orders`. Estas rutas son el contrato decidido ([[DEC-005 - Endpoints y prefijos según el código]]) y los roles también ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]). Todas las rutas están bajo `src/main/java/ar/edu/utn/frc/tup/p4/controllers/`.

## Clientes: reales y simulados

| Cliente | Implementación real | Simulada | Realidad hoy |
|---|---|---|---|
| `CourseEnrollmentClient` | No | `MockCourseEnrollmentClient` (`@Primary`) | Siempre `true`, salvo centinelas `student-not-enrolled`/`COURSE_UNENROLLED` (false) y `student-timeout`/`COURSE_TIMEOUT` (lanza) |
| `CourseInstructorClient` | No | Mock | Siempre `true`, salvo `prof-unassigned` |
| `BankHoldClient` (habla con Accounting, ex Banco) | `OutboxBankHoldClient` | `MockBankHoldClient` | Según `market.messaging.transport` |
| `InventoryItemProvisionClient` (el inventario es de Accounting, [[DEC-001 - Accounting es dueño del inventario]]) | `OutboxInventoryItemProvisionClient` | Mock | Ídem; protocolo `ITEM_PROVISION_*` que accounting no implementa |
| `OrderEventPublisher` | `OutboxOrderEventPublisher` | Mock | Ídem |
| `BankHoldQueryClient` | No | `MockBankHoldQueryClient` (solo con transporte `mock`) | Con `kafka` no hay bean |

`market.messaging.transport` vale `mock` (defecto) o `kafka` (docker/prod). En modo mock, `LoopbackDispatcher` reproduce las respuestas en el mismo proceso después del commit (`sagaLoopbackExecutor`), con centinelas por `studentId` (`student-insufficient-funds`, `student-bank-timeout`, `student-bank-unknown-code`, `student-bank-confirm-failed`, `student-bank-confirm-unavailable`, `student-inventory-failure`, `student-inventory-timeout`). El bean `gatewayRestClient` no se usa.

## Eventos

Resumen; el detalle está en [[Eventos y Kafka]]. Envelope `EventEnvelope<T>`; tópicos `accounting.holds.commands`, `accounting.holds.events`, `inventory.items.commands`, `inventory.items.events`, `market.orders.events`. **Ninguno de esos tópicos está aprovisionado en la plataforma**; accounting usa `accounting.events` y `market.events`, que son los que Mercado debe usar ([[DEC-008 - Nombre de productor y tópicos de Mercado]], [[Integración con Accounting]]). Se consumen respuestas de Accounting (ex Banco) y del inventario inexistente solo con transporte `kafka` (`AccountingHoldKafkaListener`, `InventoryItemKafkaListener`). Se publica con [[Patrón Outbox]] (`OutboxRelayJob`; lotes de 20, `market.messaging.relay.batch-size`). El grupo consumidor es `market-service`.

## Seguridad

`SecurityConfig` sin estado, CSRF apagado, CORS abierto. `GatewayIdentityFilter` arma la autenticación solo con las cabeceras del gateway, sin validar JWT: la confianza se apoya en que el puerto no está publicado. Ver [[Gateway e identidad]]. `JwksRefreshJob` consulta `app.jwks-url` cada 5 minutos como canario (`/jwks-status`), sin validar tokens.

## Pruebas

Unas 636 anotaciones `@Test` contadas; el informe de verificación de T07 declara 874 pruebas, 0 fallas, 1 omitida (la diferencia no está explicada). 22 `@SpringBootTest`, 5 `@DataJpaTest`, ningún `@WebMvcTest`. Hay pruebas de aceptación, de concurrencia (`OfferStockConcurrencyTest`, `OrderIdempotencyConcurrencyTest`), de saga (`PurchaseOrderFullSagaIntegrationTest`, `PurchaseOrderReconciliationIntegrationTest`, `OutboxLoopbackDeliveryIntegrationTest`), `KafkaSagaIntegrationTest` (Testcontainers, se omite sin Docker) y de seguridad. Calidad: [[Calidad de código]].

## Gaps conocidos

1. **Sin `BankHoldQueryClient` bajo `kafka`.** Con transporte `kafka` (defecto de docker/prod) `OrderConfirmationServiceImpl` y `BankHoldReconciliationServiceImpl` fallan al arrancar. No verificado ejecutando. Archivos: `clients/impl/MockBankHoldQueryClient.java`, `services/impl/OrderConfirmationServiceImpl.java`.
2. **Clientes de Cursos siempre simulados.** `clients/impl/MockCourseEnrollmentClient.java` y `MockCourseInstructorClient.java`. Ver [[Integración con Cursos]].
3. **Reconciliación apagada.** `bank-hold.reconciliation.enabled=false` porque Accounting no tiene todavía consulta de hold de monedas (`GET /api/accounting/holds/{holdId}` está en implementación este sprint; al integrarse, implementar el `BankHoldQueryClient` real y encenderla). `job/BankHoldReconciliationJob.java`. Ver [[DEC-009 - Contrato de holds e ítems según Accounting]].
4. **`unitsSold` nunca se incrementa y editar el stock puede producir sobreventa.** `entities/CourseCatalogOfferEntity.java`; en `services/impl/CourseCatalogManageServiceImpl.java` el nuevo `availableStock` se calcula como `totalStock - unitsSold`, y como `unitsSold` es siempre 0 se devuelven al stock las unidades ya vendidas. Decidido: incrementar `unitsSold` al confirmar la orden y calcular disponible = total - vendidos - reservados ([[DEC-013 - Reglas de la tienda]], T1); falta implementarlo.
5. **Resultado del tope de vidas sin manejar.** `LIFE_CAP_REACHED` existe en `models/enums/OrderRejectionReason.java` pero no se usa. Mercado no valida el tope: Accounting decide y reporta y Mercado reacciona ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]); falta manejar el evento que Accounting publique, cuya señal exacta está por acordar.
6. **Contrato con Accounting desalineado.** El `orderType` `DIRECT_PURCHASE` resultó válido en accounting, pero Mercado usa tópicos que no existen (`accounting.holds.*`, `inventory.items.*`, `market.orders.events`), `orderId` numérico en lugar de UUID (bloqueante: accounting rechazaría todo `HOLD_CREATE_REQUESTED` con `MALFORMED_COMMAND`) y mensajes `ITEM_PROVISION_*` que nadie implementa. Los motivos de rechazo y de release ya coinciden en el cable: `INSUFFICIENT_FUNDS` se envía como `INSUFFICIENT_BALANCE` (`models/enums/OrderRejectionReason.java:33`) y se libera siempre con `PURCHASE_NOT_COMPLETED` (`services/impl/OrderItemProvisionServiceImpl.java:62`). Los tópicos se pueden apuntar a `accounting.events` con `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `_EVENTS` (`application.properties:38-39`), sin verificar que Mercado ignore sus propios comandos en un tópico compartido. Mercado decidió alinearse al contrato de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-008 - Nombre de productor y tópicos de Mercado]]); falta implementarlo. El orden de la compra sigue abierto ([[Q-008 - Orden de la saga de compra]]). Ver la tabla en [[Integración con Accounting]].
7. **Variable de entorno inconsistente.** La plantilla usa `KAFKA_SERVERS`; Spring espera `SPRING_KAFKA_BOOTSTRAP_SERVERS` (docker: `event-bus:29092`; prod: respaldo `localhost:9092`). `src/main/resources/application-prod.properties`, `.tpi/platform/`.
8. **Vencimiento del hold no es seguro respecto de zonas horarias.** Usa `LocalDateTime` con `ZoneId.systemDefault()`. `services/impl/OrderHoldServiceImpl.java`.
9. **Usuario por defecto.** Los controladores de vitrina y de órdenes asumen `usr-student-001` si falta `X-User-Id`. `controllers/StorefrontCatalogController.java`, `StudentOrderController.java`.
10. **Sin CI en `develop`.** `.github/workflows/verify.yml` corre solo en PR a `main` o `release/**`. Los dos commits de `cf988d2` solo agregan una verificación de nombre de rama al abrir el PR. Ver [[Git workflow]].
11. **Restos de plantilla.** `docs/app_doc` y `.tpi/.tpi` son placeholders; `.compose/.env.example` está desactualizado.
12. **Lectura laxa de roles.** Algunos servicios parsean la cabecera con `contains()` (subcadena), y `CourseCatalogManageServiceImpl.validateProfessorAccess` omite el chequeo si la cabecera está vacía. Sigue pendiente de corrección tras [[DEC-006 - Roles y permisos según el código y los headers del gateway]]: quitar el respaldo `X-Roles`, endurecer el parseo y no omitir el chequeo con cabecera vacía. Verificado el 2026-10-03 contra `276af52`: el respaldo `X-Roles` ya no está en `GatewayIdentityFilter` sino en cuatro controladores, y la subcadena es explotable (un profesor no asignado con `PROFESSOR, SYSTEMS` cambia el estado de ofertas de otro curso porque `SYSTEMS` contiene `MS`). El PR #86 (T01 de [[S2-04 - Seguridad]], mergeado en `develop` el 2026-10-03 (`3e2b88b`, aprobado por Patinio)) corrigió el parseo y quitó `X-Roles`: desde `develop@3e2b88b` no queda ningún `contains()` sobre roles. El PR #92 (T02, mergeado en `develop` el 2026-10-04 (`76a9bbd`, aprobado por tommikimmel)) dejó de omitir el chequeo con cabecera vacía o sin id de usuario, y hace que las rutas de estado de oferta lean el principal autenticado ([[DEC-017 - Servicios con MS en las rutas de estado de oferta]]). Ver [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]] y [[Q-021 - Principal de servicio MS en las reglas de negocio]].

### Gaps agregados el 2026-10-01

Verificados leyendo el código:

13. **La clave de idempotencia es global, no por estudiante.** `OrderRepository.findByIdempotencyKey(String)` busca solo por la clave (`repositories/OrderRepository.java`). Ver [[Idempotencia]].
14. **El cliente simulado de matrícula es `@Primary` también en producción.** `MockCourseEnrollmentClient` no tiene `@Profile` ni condición. Ver [[Integración con Cursos]].
15. **`itemValidityDays` es un residuo.** La función de vencimiento de items entró en el PR #44 y se revirtió en el PR #60; el campo se guarda en la oferta pero nunca se envía a accounting. Los ítems no vencen y el campo se debe quitar ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]).
16. **La rama `main` está 222 commits por detrás de `develop`.**
17. **El flujo SSE de órdenes lo puede abrir el dueño o ADMIN, GESTOR y MS** (`controllers/PurchaseOrderController.java`).

22. **Motivos de rechazo desconocidos se reportan como saldo insuficiente.** Mercado solo reconoce `INSUFFICIENT_BALANCE` y `MAX_LIVES_REACHED`; `ACCOUNT_INACTIVE`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND` y otros caen en `REJECTED_INSUFFICIENT_FUNDS` con un log de advertencia (`services/impl/OrderHoldServiceImpl.java`, `applyRejection`, cerca de la línea 130). El payload de `HOLD_INCREASED` no se maneja (subastas, Fase 3). Decidido mapear todos los motivos ([[DEC-009 - Contrato de holds e ítems según Accounting]]).
24. **El profesor no puede fijar ni extender `publicationExpiresAt`.** Verificado: `dtos/manage/CatalogOfferPublishDto.java` y `dtos/manage/CatalogOfferUpdateDto.java` no lo contienen; solo aparece en los DTO de respuesta (`CourseCatalogManageDto`, `StorefrontOfferDto`). Decidido que puede extenderse ([[DEC-013 - Reglas de la tienda]], T6); falta aceptarlo al publicar y al actualizar.
23. **Tópico compartido sin verificar.** Si `accounting.holds.commands` y `accounting.holds.events` apuntan ambos a `accounting.events`, el listener de Mercado recibe sus propios comandos; falta confirmar que se ignoran sin enviarlos a DLT.

Verificado: las respuestas duplicadas están cubiertas en dos capas, deduplicación por `eventId` en `processed_events` y guarda de estado en los manejadores (`services/impl/OrderConfirmationServiceImpl.java`, cerca de la línea 385).

Reportados por la documentación del equipo, sin verificar contra el código:

18. El detalle de una oferta vencida pero activa responde 200 (origen: [[Q-015 - Reglas de la tienda]]).
19. Una cancelación por `HOLD_NOT_SETTLED` no libera el stock.
20. Una orden que queda en `CREATED` porque falló `requestHold` nunca se reconcilia.
21. `KafkaSagaIntegrationTest` (13 casos) nunca se vio en verde: se omite sin Docker.

## Relacionado

[[Market Service - Overview]], [[Roadmap de trabajo]], [[Orden de compra]], [[Eventos y Kafka]], [[Errores de la API]], [[Integración con Accounting]].
