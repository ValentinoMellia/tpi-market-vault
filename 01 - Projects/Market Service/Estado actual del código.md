---
tipo: estado
estado: vigente
verificado_contra: codigo@f7457882
actualizado: 2026-10-09
tags: [mercado, codigo, estado]
---
# Estado actual del código

> Qué hace hoy `tpi-market` (rama `develop`, commit `7528610`, PR #73). El código es la segunda fuente de verdad: lo que dice acá es lo que *es*, no necesariamente lo que *debe ser*.

Actualización (2026-10-04): `develop` avanzó a `349c8e2` (PR #76, #77, #78, #82, #84, #86, #88, #89, #90, #91 y #92 por encima de `7528610`). Verificado contra `349c8e2`: la sección Endpoints (rutas, cuerpos y formato de cable; la columna de roles no se reverificó, porque los PR #86 y #92 la cambian y no se documentan en esta actualización), Clientes (Banco simulado), Eventos, Confirmación de compra y métricas, Pruebas y los gaps 6, 21 y 23. El resto de la nota sigue verificado contra `7528610`; en particular, el gap 12 (lectura laxa de roles) y la descripción de la seguridad pueden estar desactualizados por los PR #86 y #92.

Actualización (2026-10-06): el gap 8 se verificó contra `cb12210a` (PR #118). El resto de la nota no se reverificó; sigue valiendo lo dicho arriba.

Actualización (2026-10-09): el gap 22 se verificó y resolvió contra `f7457882` (PR #110, US-5193 T07). Se mapearon los 10 motivos de rechazo de Accounting con su causa tipada (`OrderRejectionReason`), se agregó el estado terminal `REJECTED`, la columna `rejection_reason` con el método encapsulado `OrderEntity.reject(OrderRejectionReason)` y mensajes provisionales en español (`OrderRejectionMessageServiceImpl`).

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
| `GET /courses/catalog/summary?courseIds=A,B` | `CourseCatalogSummaryController` | PROFESSOR, ADMIN, GESTOR | Resumen de vitrinas por cohorte (PR #77, Taiga #5117); ver abajo |
| `POST /courses/{courseId}/catalog/manage` | ídem | ídem | Publica oferta (201) |
| `PATCH /courses/{courseId}/catalog/manage/{offerId}` | ídem | ídem | Edita nombre, descripción, precio, stock, activa |
| `PATCH /courses/{courseId}/catalog/manage/offers/{itemId}/status` | ídem | PROFESSOR, ADMIN, GESTOR, MS | Cambia estado |
| `POST /courses/{courseId}/orders` | `PurchaseOrderController` | STUDENT, ADMIN, GESTOR, MS | Cuerpo `{offer_id, idempotency_key}`; responde 202 `{order_id, status: "PROCESSING", sse_stream_url, ...}`; requiere `X-User-Id` |
| `GET /orders/stream/{orderId}` | ídem | | SSE: envía un evento de estado y cierra ([[SSE]]) |
| `GET /orders?courseId&page&size` | `StudentOrderController` | STUDENT | Órdenes propias paginadas |
| `GET /orders/{orderId}` | ídem | STUDENT | Orden propia (ajena responde 404) |
| `GET /public/ping`, `/whoami`, `/internal`, `/jwks-status` | `GatewayDiagnosticsController`, `JwksStatusController` | variable | Diagnóstico de identidad; `/internal` exige `ROLE_MS` y `market.catalog.read` |

**Formato de cable.** Todos los cuerpos REST, de entrada y de salida, van en `snake_case`, errores incluidos (PR #76 y #91; `application.properties:17`, `request_id`). Los parámetros de consulta y las cabeceras conservan su nombre. Detalle y excepciones en [[Errores de la API]]. Los payloads de Kafka siguen en `camelCase` ([[Eventos y Kafka]]).

**Resumen de vitrinas** (`controllers/CourseCatalogSummaryController.java`, ruta bajo `app.api.private-path`: `/api/market/courses/catalog/summary`). Pensado para las tarjetas del selector de cohortes, para no hacer una consulta por tarjeta. `courseIds` es obligatorio, separado por comas o repetido, hasta 50 (se recortan, se quitan vacíos y repetidos); vacío o con más de 50 responde 400 (`bad-request`). Devuelve una lista en el orden pedido con `course_id`, `active_offers` (activas, no borradas y no vencidas), `inactive_offers` (pausadas o vencidas, no borradas) y `last_updated_at` (la última actualización de cualquier oferta; sin valor si la cohorte no tiene ofertas, que vuelve con los contadores en 0). Un profesor recibe solo las cohortes que dicta (`CourseInstructorClient`, hoy simulado: ver la tabla de clientes) y ADMIN y GESTOR todas; sin `X-User-Id` el resultado de un profesor es vacío (`services/impl/CourseCatalogSummaryServiceImpl.java`). Se resuelve con una sola consulta agrupada (`CourseCatalogOfferRepository.summarizeByCourseIds`).

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

**Saldo del Banco simulado** (PR #84, US-1013; `clients/impl/MockBankBalances.java`, solo con transporte `mock`). Sin configurar nada, el Banco simulado concede todas las reservas. Dos propiedades de `market.messaging.mock.bank` (`configs/MessagingProperties.java`) lo hacen depender del saldo: `default-balance` (monedas de cada alumno en cada curso; vacía, sin límite) y `balances[<alumno>:<curso>]` (saldo de un par, que pisa el defecto). Una reserva descuenta del saldo, una liberación lo devuelve y una confirmación lo deja cobrado; si no alcanza, responde `HOLD_REJECTED` con `INSUFFICIENT_FUNDS`. Los `studentId` reservados (centinelas) se evalúan antes que el saldo. El saldo vive en memoria y se reinicia con la aplicación. Con un saldo configurado y un monto de hold nulo, `tryReserve` falla con una `NullPointerException` de mensaje explícito. Limitaciones: si una orden expira o falla sin que Mercado envíe la liberación, las monedas no se devuelven hasta reiniciar, y un `studentId` o `courseId` con `:` no se puede configurar (`README.md` del código).

## Eventos

Resumen; el detalle está en [[Eventos y Kafka]]. Envelope `EventEnvelope<T>`. Desde el PR #88 (`develop` en `349c8e2`) los tópicos por defecto son los de la plataforma ([[DEC-008 - Nombre de productor y tópicos de Mercado]], [[Integración con Accounting]]): los comandos y eventos de holds van a `accounting.events`, y los eventos de la orden (`market.messaging.topics.order-events`) a `market.events`, igual que `market-events`. Cada uno se puede cambiar con su variable `MARKET_MESSAGING_TOPIC_*` (`application.properties:46-51`). El productor saliente está unificado a `market-service` en todos los mensajes vía `market.messaging.producer` (US-5193 T04, PR #102, `2485d8cf`), sin apariciones de `tema-09-mercado`. Los del inventario siguen en `inventory.items.commands` e `inventory.items.events`, que no existen en la plataforma. Se consumen respuestas de Accounting (ex Banco) y del inventario inexistente solo con transporte `kafka` (`AccountingHoldKafkaListener`, `InventoryItemKafkaListener`). Con el tópico compartido, el listener descarta los comandos propios por `producer` y los tipos que no consume por `eventType`, antes de parsear (gap 23, resuelto por `a4e6ac76` en PR #102). Se publica con [[Patrón Outbox]] (`OutboxRelayJob`; lotes de 20, `market.messaging.relay.batch-size`). El grupo consumidor es `market-service`.

## Confirmación de compra y métricas

Al confirmarse el débito, `OrderConfirmationServiceImpl.applyConfirmResult` pasa la orden a `CONFIRMED`, publica `PURCHASE_CONFIRMED` y, en la misma transacción, como mucho un evento de ítem:

- **Vida (`LIFE`):** `LIFE_PURCHASE_CONFIRMED` en `market.events` con productor `market-service` (PR #78, US-5899). Nunca `ITEM_CONFIRMED`.
- **Otros ítems:** `ITEM_CONFIRMED` en el tópico de eventos de la orden (por defecto `market.events`), solo con `market.events.item-confirmed.enabled=true` (por defecto `false`).
- **Evento omitido:** si la oferta ya no existe o la vida tiene `livesGranted` nulo o no positivo, la orden igual se confirma (el débito ya ocurrió), no se publica el evento, se registra un `ERROR` para conciliación manual y se incrementa la métrica.

**Métrica `market.life_purchase.event_skipped`** (`services/impl/LifePurchaseMetrics.java`, PR #82). En Prometheus es `market_life_purchase_event_skipped_total`, expuesta en `/actuator/prometheus` (puerto de management `8085`), con el tag `reason` en `offer_not_found` o `invalid_lives_granted`. Las dos series se registran en 0 al arrancar, para que la alerta `increase(market_life_purchase_event_skipped_total[5m]) > 0` dispare desde el primer caso, y se incrementan después del commit, nunca en rollback, para que los reintentos de conciliación no cuenten de más. `offer_not_found` cuenta cualquier tipo de ítem, porque sin la oferta no se sabe si era una vida.

**Tipo de ítem guardado en la orden** (PR #82). `PurchaseOrderServiceImpl` copia el `itemType` de la oferta en la orden ([[Orden de compra]]). Al confirmar, la oferta se lee solo si puede hacer falta: vida, flag de `ITEM_CONFIRMED` activo u orden anterior a este cambio sin el dato.

## Seguridad

`SecurityConfig` sin estado, CSRF apagado, CORS abierto. `GatewayIdentityFilter` arma la autenticación solo con las cabeceras del gateway, sin validar JWT: la confianza se apoya en que el puerto no está publicado. Ver [[Gateway e identidad]]. `JwksRefreshJob` consulta `app.jwks-url` cada 5 minutos como canario (`/jwks-status`), sin validar tokens.

## Pruebas

768 métodos `@Test` contados en `349c8e2` (631 en `7528610`; el conteo anterior de 636 incluía anotaciones como `@TestPropertySource`); el informe de verificación de PR #110 (T07) declara 1345 pruebas ejecutadas, 0 fallas, 1 omitida (`KafkaSagaIntegrationTest`, sin Docker), con 0 violaciones en Checkstyle y PMD. 25 clases con `@SpringBootTest` (22 antes), 5 `@DataJpaTest`, ningún `@WebMvcTest`. Hay pruebas de aceptación, de concurrencia (`OfferStockConcurrencyTest`, `OrderIdempotencyConcurrencyTest`), de saga (`PurchaseOrderFullSagaIntegrationTest`, `PurchaseOrderReconciliationIntegrationTest`, `OutboxLoopbackDeliveryIntegrationTest`), de seguridad y, nuevas:

- **`KafkaSagaIntegrationTest`** (PR #89, US-5231 T01). Usa `org.testcontainers.kafka.KafkaContainer` (modo KRaft, `apache/kafka:3.7.0`) con `@DynamicPropertySource`, el starter `spring-boot-starter-kafka`, el DLT `<topic>.DLT` y un contexto aislado para el caso de `ITEM_CONFIRMED`. Tiene 9 métodos `@Test` y sigue con `@Testcontainers(disabledWithoutDocker = true)`: sin Docker se omite. Su descripción declara los 9 en verde en una corrida local con Docker o Podman; no hay CI sobre `develop` ni pude correrlo (sin Docker), así que ese resultado no está verificado aquí.
- **`AccountingContractTest`** y archivos canónicos en `src/test/resources/contracts/accounting/` (PR #90, US-5231 T02): contrato de mensajes con Accounting, sin broker; ver [[Integración con Accounting]].
- **`RestWireFormatIntegrationTest`** (PR #76 y #91): fija el `snake_case` de los cuerpos de éxito y de error con el contexto real.

Calidad: [[Calidad de código]].

## Gaps conocidos

1. **Sin `BankHoldQueryClient` bajo `kafka`.** Con transporte `kafka` (defecto de docker/prod) `OrderConfirmationServiceImpl` y `BankHoldReconciliationServiceImpl` fallan al arrancar. No verificado ejecutando. Archivos: `clients/impl/MockBankHoldQueryClient.java`, `services/impl/OrderConfirmationServiceImpl.java`.
2. **Clientes de Cursos siempre simulados.** `clients/impl/MockCourseEnrollmentClient.java` y `MockCourseInstructorClient.java`. Ver [[Integración con Cursos]].
3. **Reconciliación apagada.** `bank-hold.reconciliation.enabled=false` porque Accounting no tiene todavía consulta de hold de monedas (`GET /api/accounting/holds/{holdId}` está en implementación este sprint; al integrarse, implementar el `BankHoldQueryClient` real y encenderla). `job/BankHoldReconciliationJob.java`. Ver [[DEC-009 - Contrato de holds e ítems según Accounting]].
4. **`unitsSold` nunca se incrementa y editar el stock puede producir sobreventa.** `entities/CourseCatalogOfferEntity.java`; en `services/impl/CourseCatalogManageServiceImpl.java` el nuevo `availableStock` se calcula como `totalStock - unitsSold`, y como `unitsSold` es siempre 0 se devuelven al stock las unidades ya vendidas. Decidido: incrementar `unitsSold` al confirmar la orden y calcular disponible = total - vendidos - reservados ([[DEC-013 - Reglas de la tienda]], T1); falta implementarlo.
5. **Tope de vidas (resuelto por US-6268, en `develop` desde el 2026-10-04; verificado contra `74e671ef`).** Mercado valida antes del hold con `PurchaseValidationService.validateLifeCap` (422 `LIFE_CAP_REACHED`), contando también las vidas de sus órdenes de vidas en vuelo, lee las vidas con `AccountingEquipSummaryClient` y PAR-12 de `market.lives.max-lives`, y consume `LIFE_PURCHASE_REJECTED` marcando la orden `SETTLED_UNCREDITED` ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[S2-11 - Acuerdos de compra de vidas con Accounting]]). El cliente real queda apagado por defecto (`MARKET_ACCOUNTING_CLIENT=mock`) hasta confirmar cómo se emite el token de servicio.
6. **Contrato con Accounting parcialmente alineado.** Desde el PR #88 (`develop` en `349c8e2`) los tópicos por defecto son `accounting.events` y `market.events`, y `HOLD_CREATE_REQUESTED` lleva el `orderRef` UUID como `orderId` (`entities/OrderEntity.java:116`, `services/impl/OrderHoldServiceImpl.java:100`). Siguen desalineados: los tópicos `inventory.items.*`, que no existen, y los mensajes `ITEM_PROVISION_*`, que nadie implementa; `LIFE_PURCHASE_CONFIRMED` también lleva el `orderRef` desde US-6268 (`tpi-market` #95), pero `ITEM_CONFIRMED` (apagado) y `PURCHASE_CONFIRMED` llevan todavía el `id` numérico como `orderId`. El `orderType` `DIRECT_PURCHASE` resultó válido en accounting. El mapeo de los 10 motivos de rechazo quedó resuelto en `develop` (PR #110, `f7457882`, US-5193 T07; gap 22): `INSUFFICIENT_FUNDS` viaja como `INSUFFICIENT_BALANCE` (`models/enums/OrderRejectionReason.java:33`) y los otros 9 motivos pasan a `REJECTED` persistiendo `rejectionReason`. La liberación usa `PURCHASE_NOT_COMPLETED` (`services/impl/OrderItemProvisionServiceImpl.java:62`). Los tópicos se cambian con `MARKET_MESSAGING_TOPIC_*` (`application.properties:46-51`); la verificación del tópico compartido (T03) y la unificación del productor a `market-service` (T04) quedaron resueltas en el PR #102 (`2485d8cf`). Mercado decidió alinearse al contrato de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-008 - Nombre de productor y tópicos de Mercado]]); falta implementar el resto (T05/T06 y consulta de hold). El orden de la compra sigue abierto ([[Q-008 - Orden de la saga de compra]]). Ver la tabla en [[Integración con Accounting]].
7. **Variable de entorno inconsistente.** La plantilla usa `KAFKA_SERVERS`; Spring espera `SPRING_KAFKA_BOOTSTRAP_SERVERS` (docker: `event-bus:29092`; prod: respaldo `localhost:9092`). `src/main/resources/application-prod.properties`, `.tpi/platform/`.
8. **Vencimiento del hold en UTC: resuelto en `develop` desde el PR #118.** Hasta ese PR, `services/impl/OrderHoldServiceImpl.java` guardaba el vencimiento como `LocalDateTime` con `ZoneId.systemDefault()`, y la reconciliación comparaba contra `LocalDateTime.now()` en la zona del servidor (`services/impl/BankHoldReconciliationServiceImpl.java`). Lo resolvió el PR #118 (T02 de [[S2-05 - Robustez de la compra]], mergeado en `develop` el 2026-10-06 (`cb12210a`, aprobado y mergeado por tommikimmel)): desde `develop@cb12210a` el vencimiento se guarda en UTC y se compara en UTC con el `Clock` de la aplicación. Las filas guardadas antes del deploy quedan con la hora del servidor.
9. **Usuario por defecto: resuelto en `develop` desde el PR #93.** Hasta ese PR, `controllers/StorefrontCatalogController.java`, `CatalogOfferController.java` y `StudentOrderController.java` tomaban `X-User-Id` con el valor por defecto `usr-student-001`. Por HTTP solo lo alcanzaba un servicio con `MS` en los tres GET de la vitrina: a un usuario sin `X-User-Id` el filtro no lo autentica (401) y los GET de `StudentOrderController` son solo para STUDENT, así que un servicio recibía 403 antes de llegar al valor por defecto. El PR #93 (T03 de [[S2-04 - Seguridad]], mergeado en `develop` el 2026-10-06 (`011fe7d6`, aprobado y mergeado por Lucio Wiesek)) hace obligatoria la cabecera en los cinco GET (400 `missing-header` si falta) y, con la cabecera vacía, los detalles de la vitrina responden 403 en lugar de saltear la matrícula.
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

22. **Motivos de rechazo desconocidos se reportan como saldo insuficiente: resuelto en `develop` tras `f7457882`.** Antes de este PR, Mercado solo reconocía `INSUFFICIENT_BALANCE` y `MAX_LIVES_REACHED`; cualquier otro motivo caía en `REJECTED_INSUFFICIENT_FUNDS`. Lo resolvió el PR #110 (US-5193 T07, commit `14f7fb75`, merge `f7457882`): `OrderRejectionReason` incorporó los 9 motivos restantes del contrato de Accounting (12 en total: `INSUFFICIENT_FUNDS` con alias `INSUFFICIENT_BALANCE`, `ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`, `LIFE_CAP_REACHED` y `PROVISION_FAILED`); `OrderStatus` sumó el estado terminal `REJECTED`; `OrderEntity` agregó la columna `rejection_reason` y el método encapsulado `reject(OrderRejectionReason)` (prohibiendo la llamada directa a `transitionTo(REJECTED)`); `OrderHoldServiceImpl.applyRejection` envía a `REJECTED_INSUFFICIENT_FUNDS` solo `INSUFFICIENT_BALANCE`/`INSUFFICIENT_FUNDS` y a `REJECTED` los otros 9 motivos persistiendo su causa tipada; códigos desconocidos caen en `PROVISION_FAILED` con log de advertencia y pasan a `REJECTED`; en todos los rechazos se libera el stock reservado (`releaseStockIfReserved`); `OrderRejectionMessageServiceImpl` provee mensajes provisionales en español mapeados en `OrderMapper` y `OrderStatusEventMapper`; y `CourseSalesSummaryServiceImpl` incluye `REJECTED` en `CLOSED_STATUSES`. Cumple plenamente [[DEC-009 - Contrato de holds e ítems según Accounting]]. El payload de `HOLD_INCREASED` sigue en Fase 3 (subastas).
23. **Tópico compartido: resuelto en `develop` tras `349c8e2`.** Desde el PR #88 `accounting-holds-commands` y `accounting-holds-events` valen `accounting.events`, y en `349c8e2` el filtro corría después del parseo, por lo que `HOLD_CREATE_REQUESTED` y `HOLD_RELEASE_REQUESTED` propios iban a `accounting.events.DLT`. Lo corrigió `a4e6ac76` (US-5193 T03, PR #102, merge `2485d8cf`): `AccountingHoldKafkaListener.onMessage` descarta por `producer` (`market-service`) y por `eventType` antes de parsear; cubierto por `AccountingHoldKafkaListenerTest` y por `KafkaSagaIntegrationTest` con broker real. Verificado en `origin/develop` (`74e671ef`). Detalle en [[Eventos y Kafka]].
24. **El profesor no puede fijar ni extender `publicationExpiresAt`.** Verificado: `dtos/manage/CatalogOfferPublishDto.java` y `dtos/manage/CatalogOfferUpdateDto.java` no lo contienen; solo aparece en los DTO de respuesta (`CourseCatalogManageDto`, `StorefrontOfferDto`). Decidido que puede extenderse ([[DEC-013 - Reglas de la tienda]], T6); falta aceptarlo al publicar y al actualizar.

Verificado: las respuestas duplicadas están cubiertas en dos capas, deduplicación por `eventId` en `processed_events` y guarda de estado en los manejadores (`services/impl/OrderConfirmationServiceImpl.java`, cerca de la línea 385).

Reportados por la documentación del equipo, sin verificar contra el código:

18. El detalle de una oferta vencida pero activa responde 200 (origen: [[Q-015 - Reglas de la tienda]]).
19. Una cancelación por `HOLD_NOT_SETTLED` no libera el stock. Verificado el 2026-10-06 contra `f7457882`: es a propósito (US-138 T05, decisión CD12 de su diseño), porque el ítem ya se entregó; `cancelUnsettled` en `services/impl/OrderConfirmationServiceImpl.java` solo deja un `ERROR` para revisión manual. Decidido que queda así: [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]] (origen: [[Q-023 - Stock de una compra cancelada por HOLD_NOT_SETTLED]]). No es un defecto.
20. Una orden que queda en `CREATED` porque falló `requestHold` nunca se reconcilia.
21. `KafkaSagaIntegrationTest`: el PR #89 lo migró a KRaft y declara los 9 casos en verde en una corrida local; sin Docker se omite y no hay CI sobre `develop`, así que no está verificado aquí (ver la sección Pruebas).

## Relacionado

[[Market Service - Overview]], [[Roadmap de trabajo]], [[Orden de compra]], [[Eventos y Kafka]], [[Errores de la API]], [[Integración con Accounting]].
