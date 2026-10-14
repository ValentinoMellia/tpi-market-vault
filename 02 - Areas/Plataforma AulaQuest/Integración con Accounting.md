---
tipo: integracion
estado: vigente
verificado_contra: DEC-025, codigo@d3b7a4de
actualizado: 2026-10-12
tags: [mercado, integracion, accounting, banco, inventario, kafka]
---
# Integración con Accounting

> Accounting (ex Banco, Tema 08, grupo G12 en Taiga) es el dueño de las monedas, las vidas y el inventario del estudiante. Mercado le pide retener, confirmar o liberar monedas y le avisa qué item se compró. Mercado adoptó el contrato de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]]) y la Propuesta C para la saga de compra directa de ítems ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]), que cierra [[Q-008 - Orden de la saga de compra]].

Actualización (2026-10-12): la integración de la saga de compra directa de ítems, emisión de `ITEM_CONFIRMED`, revocación, manejo de fallos y vidas se verificó contra `d3b7a4de` (PR #179, #182, #184, #186, #187, #188 y #189 de `tpi-market`, US-7697 T01, T02, T03, T04, T05 y T08). Lo que dice del código de Accounting sigue verificado contra su `develop` del 2026-10-01; las respuestas de revocación y fallo están pendientes de ratificación de Accounting.

## Decisiones que gobiernan esta integración

| Decisión | Qué fija |
|---|---|
| [[DEC-001 - Accounting es dueño del inventario]] | El inventario es de Accounting |
| [[DEC-003 - Holds solo por Kafka]] | Holds solo por Kafka; la única lectura REST es la consulta de estado |
| [[DEC-007 - Tope de vidas, Accounting decide y reporta]] | Accounting aplica el tope y reporta; Mercado reacciona y, desde la enmienda del 2026-10-04, valida el tope de forma preventiva antes del hold |
| [[DEC-008 - Nombre de productor y tópicos de Mercado]] | `market-service` en todos los mensajes salientes (unificado en PR #102, `2485d8cf`), `market.events` y `accounting.events`, `SNAKE_CASE` en inglés |
| [[DEC-009 - Contrato de holds e ítems según Accounting]] | Contrato de holds e ítems de Accounting |
| [[DEC-010 - Los efectos de los ítems no son de Mercado]] | Escudos en Accounting, multiplicadores en el motor de desafíos |
| [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] | Los ítems no vencen |
| [[DEC-014 - Reglas de subastas]] | Un release por postor al cancelar o cerrar una subasta; sin release por `orderId` |
| [[DEC-025 - Saga de compra de ítems según la Propuesta C]] | Adopta la Propuesta C para compra directa de ítems: retener fondos (`HOLD_CREATED`), acreditar (`ITEM_CONFIRMED` → `ITEM_CREDITED`), confirmar débito (`HOLD_CONFIRM_REQUESTED` → `HOLD_CONFIRMED`) y compensación simétrica con `ITEM_REVOKE_REQUESTED` ante fallos o plazos vencidos; cierra [[Q-008 - Orden de la saga de compra]] |

Esta nota reemplaza a las antiguas "Integración con Banco" e "Integración con Inventario" (archivadas), porque [[DEC-001 - Accounting es dueño del inventario]] fusionó ambas responsabilidades en un solo equipo.

## Equipo y responsabilidad

Servicio `accounting-service` (repositorio `2026-P4-BE/tpi-accounting`, rama `develop`). Los hechos de esta nota se verificaron contra su código y, para su propio lado, prevalecen sobre cualquier documento ([[Market Service - Overview]] explica la jerarquía).

| Dato | Valor |
|---|---|
| Stack | MySQL 8 con Flyway |
| Puerto | 8090 (gestión 8091), prefijo `/api/accounting` |
| Registro | Eureka como `accounting-service` |
| Kafka | grupo consumidor `tema-08-accounting-service-group`, productor `tema-08-accounting-service` |
| Outbox | relay cada ~5 s; 3 reintentos de 2 s y luego DLT |
| Clave de partición | `studentId:courseId` |
| Envelope | 6 campos; `eventVersion` entero (1) y `eventId` UUID canónico |

Es dueño de:

- **Monedas**: `student_accounts` y `coin_holds`.
- **Vidas**: `current_lives`, `reserved_lives`, `lives_ledgers`, `life_holds`.
- **Inventario**: `inventory_items`, una fila por unidad (ver más abajo).

## Hold de monedas

Un solo tópico, `accounting.events` (más `accounting.events.DLT`), para comandos y respuestas. Conforme a `contratos-kafka v8`, el wire format utiliza envelope y payloads en `snake_case`. La clave de correlación es el `event_id` del comando: las respuestas lo devuelven como `correlation_id`.

| Comando (Mercado a accounting) | Campos |
|---|---|
| `HOLD_CREATE_REQUESTED` | `student_id`, `course_id`, `order_id` (UUID canónico), `order_type` (`DIRECT_PURCHASE` o `AUCTION_BID`), `amount`, `ttl_seconds` |
| `HOLD_INCREASE_REQUESTED` | `hold_id`, `new_total_amount` |
| `HOLD_CONFIRM_REQUESTED` | `hold_id`, `order_id` |
| `HOLD_RELEASE_REQUESTED` | `hold_id`, `release_reason` (enum tipado `BankHoldReleaseReason`: `AUCTION_LOST`, `AUCTION_CANCELLED` o `PURCHASE_NOT_COMPLETED`; PR #115, `5de30854`) |

- `ttl_seconds` se ignora para `DIRECT_PURCHASE` (accounting usa 300 s fijos) y es obligatorio y mayor que 0 para `AUCTION_BID`.
- Respuestas: `HOLD_CREATED`, `HOLD_INCREASED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `HOLD_REJECTED {correlation_id, hold_id, reason, message}` y `HOLD_EXPIRED` (declarado; el documento del equipo discute si el planificador de vencimiento existe).
- Motivos de rechazo: `ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INSUFFICIENT_BALANCE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`.
- Restricción `UNIQUE(account_id, order_id)`: **un hold por `order_id` para siempre**. No hay liberación en lote ni captura parcial.
- Con esto queda confirmado que `DIRECT_PURCHASE` es un `order_type` válido y que la confirmación no lleva monto ni el hold lleva moneda.

## Entrega del item y compensación

| Dirección | Mensaje | Tópico | Campos |
|---|---|---|---|
| Mercado a Accounting | `ITEM_CONFIRMED` | `market.events` | `student_id`, `course_id`, `order_id` (UUID canónico `orderRef`), `catalog_item_id`, `item_name`, `item_type`, `effect` |
| Accounting a Mercado | `ITEM_CREDITED` | `accounting.events` | `student_id`, `course_id`, `item_instance_id`, `item_name`, `item_type`, `source_reference_id` (= `order_id`); correlaciona por `source_reference_id` |
| Mercado a Accounting | `ITEM_REVOKE_REQUESTED` | `accounting.events` | `correlation_id` (UUID igual al `event_id`), `order_id` (`orderRef` UUID canónico), `student_id`, `course_id`, `revoke_reason` (`PURCHASE_NOT_COMPLETED`) |

- **Formato de cable (`snake_case` según contratos-kafka v8):** Accounting develop ya publica y lee exclusivamente en `snake_case` (`tpi-accounting@10e31d85`, 2026-10-11). La migración de Mercado a `snake_case` está mergeada en `develop@d3b7a4de` (PR #186).
- **Contrato congelado de `ITEM_REVOKE_REQUESTED` (lado Mercado, adoptado en [[DEC-025 - Saga de compra de ítems según la Propuesta C]]):** Clave de partición `student_id:course_id`, productor `market-service`, envelope versión 1 (`contratos-kafka v8`). No lleva `item_instance_id`: Accounting revoca la unidad asociada a la orden (`order_id`).
- **Esquemas de respuesta propuestos (consumidores implementados en Mercado y mergeados en `develop@d3b7a4de` vía PR #188, T05; pendientes de ratificación por Accounting):**
  - `ITEM_CREDIT_FAILED` en `accounting.events`: `{student_id, course_id, source_reference_id, reason, message}`. Comportamiento en Mercado (T05): cancela la orden con motivo `ITEM_CREDIT_FAILED`, libera el stock reservado y emite `HOLD_RELEASE_REQUESTED(PURCHASE_NOT_COMPLETED)` **sin revocar ítem**.
  - `ITEM_REVOKED` en `accounting.events`: `{correlation_id, order_id, student_id, course_id, revoked_item_count}`. Comportamiento en Mercado (T05): confirma la revocación de forma idempotente (`revoked_item_count = 0` indica "nada que revocar").
  - `ITEM_REVOKE_FAILED` en `accounting.events`: `{correlation_id, order_id, student_id, course_id, reason, message}`. Comportamiento en Mercado (T05): escala a revisión administrativa duradera con motivo `ITEM_REVOKE_FAILED` (`OrderReviewReason`), emite log `ERROR`, incrementa la métrica `market.purchase.revoke_failed{reason}` y establece la bandera booleana independiente `revoke_failed = true` en la tabla `orders` (mediante `PurchaseReviewService.markRevokeFailed`), la cual se marca siempre ante un fallo de revocación aunque la orden ya tuviera otro motivo de revisión asignado.
- No existen los eventos salientes `ITEM_PROVISION_*` (eliminados en T01, PR #179, mergeado en `develop@d3b7a4de`).
- `InventoryCatalog` solo acepta `ITEM-PLACEHOLDER-1` a `ITEM-PLACEHOLDER-3`; cualquier otro `catalog_item_id` va a DLT. Las cargas máximas (`max_charges`) están fijas ahí y el ámbito se guarda `NULL` (equivale a `ALL`).

## Inventario (fusionado desde la nota de Inventario)

`inventory_items`: una fila por unidad, con `account_id`, `catalog_item_id`, `item_name`, `item_type`, `item_effect` (texto libre), `applicable_challenge_scope`, `order_id`, `status`, `max_charges`, `remaining_uses` e identificadores de desafíos reservados y consumidos.

- Estados: `AVAILABLE`, `EQUIPPED`, `RESERVED`, `CONSUMED`.
- Equipar y desequipar los pide Roadmap con `ITEM_EQUIP_REQUESTED` e `ITEM_UNEQUIP_REQUESTED`.
- Un item se reserva cuando empieza un desafío y se consume al liquidar, descontando `remaining_uses`.
- Efectos: el motor de desafíos publica `CHALLENGE_COMPLETED` y `CHALLENGE_ABORTED` en `challenges.events` (carga en `snake_case`, con `resources.active_item`). Accounting consume los items reservados y aplica `SHIELD` (libera el hold de vida con `SHIELD_APPLIED`). Los multiplicadores de XP y monedas los resuelve el motor de desafíos; accounting no tiene lógica de `BOOST` ni de `LIFE`. Los items `NO_EXAMS` nunca se reservan (todavía no hay marca de examen). **No hay vencimiento de items en ningún servicio y no lo habrá** ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]). Los efectos los reparten Accounting y el motor de desafíos, no Mercado ([[DEC-010 - Los efectos de los ítems no son de Mercado]]).

Lectura REST para Mercado y otros, bajo `/api/accounting/courses/{courseId}/accounts`:

| Ruta | Roles |
|---|---|
| `GET /me/items` | STUDENT |
| `GET /{studentId}/items` | ADMIN |
| `GET /{studentId}/items-history` | ADMIN |
| `GET /{studentId}/equip-summary` | MS, ADMIN, STUDENT (Mercado la consume con token de servicio antes de vender vidas) |
| `POST /courses/{courseId}/challenge-reservations` | MS (motor de desafíos) |

## Vidas

El tope PAR-12 viene de Backoffice (evento `GLOBAL_CONFIGURATION_CHANGED {initialLives, maxLives}` en `administration.events`, valores por defecto 3 y 3, ver [[Integración con Backoffice]]). Accounting **recorta (clamp), nunca rechaza**: el crédito se trunca y queda una fila de libro con `delta` 0.

Decisión original ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]): Mercado **no validaba** el tope. Accounting aplica su regla (hoy el recorte, PAR-12) y reporta el resultado de una compra de vida; Mercado emite `LIFE_PURCHASE_CONFIRMED` en `market.events` una vez confirmada la compra y debitadas las monedas (tras confirmar el hold) con sobre contratos-kafka v5, key `studentId` y payload `{studentId, courseId, orderId, quantity}` ([[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]]). Accounting reporta las vidas efectivamente acreditadas con `LIFE_CREDITED` en `accounting.events`. Pregunta de origen: [[Q-002 - Vidas y tope de vidas]].

### Acuerdos del 2026-10-04 (enmienda a DEC-007, US-6268)

Como Accounting acredita 0 y no devuelve monedas si el alumno ya tiene el máximo, Mercado valida antes del hold ([[S2-11 - Acuerdos de compra de vidas con Accounting]]). Accounting propuso estos puntos el 2026-10-03 y Mercado los aceptó al implementarlos; falta la ratificación de `LIFE_PURCHASE_REJECTED` por Tema 11 en `contratos-kafka`. La columna de Mercado está verificada contra `develop` (`74e671ef`).

| Punto | Acuerdo | Cómo lo implementa Mercado |
|---|---|---|
| Vidas actuales | `GET /api/accounting/courses/{courseId}/accounts/{studentId}/equip-summary` por el Gateway con token de servicio; devuelve `currentLives` y `reservedLives` | `AccountingEquipSummaryClient` (`clients/impl/GatewayAccountingEquipSummaryClient.java`, activo con `MARKET_ACCOUNTING_CLIENT=gateway` y `ACCOUNTING_SERVICE_TOKEN`); por defecto `MockAccountingEquipSummaryClient` |
| Máximo | PAR-12 de Backoffice; Accounting no lo expone | `market.lives.max-lives` (`MARKET_LIVES_MAX_LIVES`, por defecto 3) en `configs/LifeCapProperties.java` |
| Cuántas puede comprar | `max(0, maxLives − currentLives)`, validación preventiva | `PurchaseValidationServiceImpl.validateLifeCap` calcula `max(0, maxLives − (currentLives + livesInFlight))`, donde `livesInFlight` son las vidas de las órdenes de vidas propias todavía en vuelo (`CREATED`, `HOLD_REQUESTED`, `HOLD_GRANTED`, `ITEM_PROVISION_REQUESTED`, `ITEM_PROVISIONED`; `OrderRepository.sumLivesInFlight`): dos compras seguidas se frenan aunque Accounting no haya acreditado la primera. `reservedLives` se lee pero no se usa. Si la oferta otorga más vidas, 422 `LIFE_CAP_REACHED` antes de crear la orden y el hold, con el texto de US-142 si no entra ninguna o con cuántas entran si entran algunas. Sin cuenta (404) no bloquea: el hold se rechaza con `ACCOUNT_NOT_FOUND`. Accounting caído: 503 |
| Identificadores | `courseId` igual al del hold; `orderId` igual al de la orden y el hold, como máximo 36 caracteres | `LIFE_PURCHASE_CONFIRMED.orderId` = `orderRef` UUID (`OrderEntity.bankOrderId()`). `dtos/events/ExternalId.java` valida `orderId`, `studentId` y `courseId` (36 caracteres como máximo) en `HOLD_CREATE_REQUESTED` y en `LIFE_PURCHASE_CONFIRMED`; `PurchaseOrderServiceImpl` responde 400 si `studentId` o `courseId` se pasan |
| Cantidad | Sin tope por orden; entero `>= 1` | `quantity` = `livesGranted` de la oferta |
| Cuenta inexistente o inactiva | `LIFE_PURCHASE_REJECTED {orderId, studentId, courseId, quantity, reason, message}` en `accounting.events`, `reason` `ACCOUNT_NOT_FOUND` o `ACCOUNT_INACTIVE`; sin crédito ni reintento | `AccountingLifePurchaseEventHandler`: deduplica por `eventId` y marca la orden `SETTLED_UNCREDITED` con alerta de auditoría y métrica `market_life_purchase_uncredited_total`. La devolución la pide un ADMIN desde BackOffice (`COIN_LEDGER_REVERSAL_REQUESTED`), solo con la cuenta activa |
| Prevención | `LIFE_PURCHASE_CONFIRMED` solo después de `HOLD_CONFIRMED`, nunca tras `HOLD_RELEASED` o `HOLD_REJECTED` | Se publica en la misma transacción que pasa la orden a `CONFIRMED` al recibir `HOLD_CONFIRMED` |

## Diferencias entre el código de Mercado y el de accounting

Mercado se alinea a la columna de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-008 - Nombre de productor y tópicos de Mercado]], [[DEC-025 - Saga de compra de ítems según la Propuesta C]]). Los cambios de US-7697 (T01..T05, T08 y wire format `snake_case`) están verificados contra `develop@d3b7a4de`.

| Tema | Mercado hoy | Accounting |
|---|---|---|
| Tópicos de holds | `accounting.events` por defecto; alineado | `accounting.events` |
| Tópico propio | `market.events` por defecto; alineado | `market.events` |
| Provisión / Ítems | `ITEM_CONFIRMED` (en `market.events`) y `ITEM_CREDITED` (en `accounting.events`); T01 eliminó los clientes salientes de `ITEM_PROVISION_*` | `ITEM_CONFIRMED` e `ITEM_CREDITED`; falla silenciosa a DLT (propuesta de `ITEM_CREDIT_FAILED` pendiente de ratificación) |
| Orden de la saga | Propuesta C adoptada ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]): retener fondos (`HOLD_CREATED`), acreditar (`ITEM_CONFIRMED` → `ITEM_CREDITED`), confirmar débito (`HOLD_CONFIRM_REQUESTED` → `HOLD_CONFIRMED`) y compensación con `ITEM_REVOKE_REQUESTED` | Propuesta C acordada para ítems directos; pendiente ratificación de esquemas de respuesta |
| `order_id` | UUID canónico (`orderRef`) en `HOLD_CREATE_REQUESTED`, `LIFE_PURCHASE_CONFIRMED`, `ITEM_CONFIRMED` e `ITEM_REVOKE_REQUESTED` | UUID canónico |
| Correlación del item | `source_reference_id` = `order_id` | `source_reference_id` = `order_id` |
| Revocación de ítems | `ITEM_REVOKE_REQUESTED` (congelado en Mercado, T04 en `develop@d3b7a4de`) | Pendiente de ratificación e implementación |
| `PURCHASE_CONFIRMED` | se publica | nadie lo consume |
| Consulta de hold | `HttpBankHoldQueryClient` consume `GET /api/accounting/holds/{holdId}` con token dinámico (PR #116, `e456c55f`); alineado | `GET /api/accounting/holds/{holdId}` |
| Catálogo | plantillas `tpl-*` | solo `ITEM-PLACEHOLDER-1` a `3` |

Los motivos de rechazo y de release **no** figuran como diferencia: Mercado mapea los 10 motivos de rechazo contractuales de Accounting (`OrderRejectionReason`, PR #110, US-5193 T07, `f7457882`), y restringe `BankHoldReleaseReason` estrictamente a los 3 valores canónicos del contrato (`AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`) con DTO tipado (`BankHoldReleaseRequestDto`, PR #115, US-5193 T08, `5de30854`), liberando siempre con `PURCHASE_NOT_COMPLETED` (`services/impl/OrderItemProvisionServiceImpl.java:63`).

El plan de alineación está en [[Roadmap de trabajo]] (P0).

## Mensaje de accounting del 2026-10-01 y estado

Accounting envió siete puntos. Estado de cada uno contra el código de Mercado (`codigo@7528610`; los puntos 1 y 2 se reverificaron contra `349c8e2`, y el orden y revocación contra `d3b7a4de`):

| # | Pedido de accounting | Estado en Mercado |
|---|---|---|
| 1 | Apuntar los tópicos de holds a `accounting.events` | Hecho en `develop` (PR #88): `accounting.events` es el valor por defecto de `accounting-holds-commands` y `accounting-holds-events`, con las variables `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `_EVENTS` para cambiarlo (`src/main/resources/application.properties:46-47`, `.compose/docker-compose.yml`). **Riesgo del tópico compartido, resuelto**: tras el PR #88 los comandos propios `HOLD_CREATE_REQUESTED` y `HOLD_RELEASE_REQUESTED` terminaban en `accounting.events.DLT` por filtrarse después del parseo. El PR #102 (`2485d8cf`, commit `a4e6ac76`, US-5193 T03) resolvió esto descartando por `producer` (`market-service`) y por `eventType` antes de parsear, con 0 mensajes en DLT ([[Eventos y Kafka]]) |
| 2 | `order_id` UUID canónico (**bloqueante**) | Cumplido en todos los comandos de Mercado: `HOLD_CREATE_REQUESTED` (PR #88), `LIFE_PURCHASE_CONFIRMED` (PR #95), `ITEM_CONFIRMED` (PR #179, T01) e `ITEM_REVOKE_REQUESTED` (PR #184, T04) envían el `orderRef` UUID inmutable de la orden (`entities/OrderEntity.java:116`; [[Orden de compra]]) |
| 3 | `HOLD_INCREASE_REQUESTED` (envía el **total nuevo**, no la diferencia) | No implementado; las subastas son Fase 3 ([[Subasta]], [[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]) |
| 4 | Cancelar una subasta con `HOLD_RELEASE_REQUESTED` por `orderId`, sin `holdId`, con `AUCTION_CANCELLED`, liberando todos los holds de la orden | **No adoptado** ([[DEC-014 - Reglas de subastas]]): Mercado envía **un `HOLD_RELEASE_REQUESTED` por postor** (con `holdId`). **A comunicar a Accounting**; es coherente con su restricción de un hold por `orderId` y sin liberación en lote |
| 5 | Mercado debe manejar `ACCOUNT_INACTIVE`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND` y el payload de `HOLD_INCREASED` | **Resuelto para los holds en develop** (PR #110, US-5193 T07, `f7457882`): `OrderRejectionReason` mapea los 10 motivos de rechazo del contrato; solo `INSUFFICIENT_BALANCE` pasa a `REJECTED_INSUFFICIENT_FUNDS`, los otros 9 pasan a `REJECTED` y persisten `rejectionReason` con mensaje provisional en español (`OrderRejectionMessageServiceImpl`). `HOLD_INCREASED` sigue en Fase 3 (subastas) |
| 6 | Deduplicar respuestas reenviadas (misma `correlation_id`) | Sí, en dos capas: deduplicación por `event_id` en `processed_events` y guarda de estado (los manejadores ignoran un evento si la orden no está en el estado esperado, p. ej. `services/impl/OrderConfirmationServiceImpl.java`). Ver [[Entrega at-least-once y deduplicación]] |
| 7 | `GET /api/accounting/holds/{holdId}` en implementación este sprint; avisarán al integrarlo para encender `bank-hold.reconciliation` | **Resuelto en develop** (PR #116, `e456c55f`, issue #114): `HttpBankHoldQueryClient` implementa la consulta real mediante token dinámico de Identity (`IdentityServiceTokenClient`), alias `camelCase` y `snake_case` vía `@JsonAlias`, timeouts configurables e invalidación ante 401/403. Utilizado por la reconciliación periódica de compras directas (T03, PR #182) |

El orden de la saga quedó resuelto formalmente en [[DEC-025 - Saga de compra de ítems según la Propuesta C]]: se adoptó la Propuesta C para compras directas de ítems, cerrando [[Q-008 - Orden de la saga de compra]] (archivada).

## Estado actual en el código de Mercado

El listener de `accounting.events` (`listeners/AccountingHoldKafkaListener.java`, método `onMessage`) primero descarta por `producer` los mensajes que publicó el propio `market-service` (US-5193 T03, `a4e6ac76`, PR #102 merge `2485d8cf`): así se ignoran los comandos de Mercado en el tópico compartido. Después enruta por `event_type`: `LIFE_PURCHASE_REJECTED` a `AccountingLifePurchaseEventHandler`, los eventos de hold a `AccountingHoldEventHandler`, y `ITEM_CREDITED` a `AccountingItemCreditedEventHandler` (que correlaciona por `source_reference_id = order_id` y procesa la transición a `ITEM_PROVISIONED` con guarda de plazos `ConfirmationDeadlineGuard`). Todos los mensajes salientes usan el productor `market-service` unificado (US-5193 T04, `1e458bb0`, PR #102). Implementado con [[Patrón Outbox]]: `clients/impl/OutboxBankHoldClient.java` e `ItemRevokeClient` (`OutboxItemRevokeClient.java`, T04); listeners en `kafka`. Con `mock` responden `MockBankHoldClient`, `MockOrderEventPublisher` y `MockItemRevokeClient`. `BankHoldQueryClient` cuenta con `HttpBankHoldQueryClient` (con transporte `kafka`, PR #116, `e456c55f`) y `MockBankHoldQueryClient`. Además, `AccountingHoldEventHandler` resuelve `HOLD_RELEASED` por `hold_id` cuando llega sin `correlation_id`, disparando compensación atómica si la orden está en espera.

### Pruebas de contrato (PR #90, US-5231 T02)

`src/test/java/ar/edu/utn/frc/tup/p4/contracts/AccountingContractTest.java` fija el contrato de mensajes con archivos canónicos en `src/test/resources/contracts/accounting/` (un JSON por mensaje: los comandos `hold-create-requested`, `hold-increase-requested`, `hold-confirm-requested` y `hold-release-requested`; las respuestas `hold-created`, `hold-rejected`, `hold-increased`, `hold-confirmed`, `hold-released` y `hold-expired`; y `item-confirmed` e `item-credited`). Comprueba el envelope de 6 campos (rechaza con `MalformedEventException` un `event_id` ausente o no UUID, `event_version` menor que 1, `event_type` o `timestamp` ausentes, `producer` en blanco y JSON roto), las cadenas de correlación entre comandos y respuestas, la serialización real de `OutboxBankHoldClient` (alta, confirmación y liberación) contra esos archivos y el procesamiento de las respuestas con `AccountingHoldEventHandler`. Son pruebas locales contra los archivos del repositorio, no contra Accounting en ejecución.

## Brechas del lado de accounting

- La consulta REST del estado de un hold de monedas (`GET /api/accounting/holds/{holdId}`) fue integrada en Mercado mediante `HttpBankHoldQueryClient` (PR #116, `e456c55f`); resta validar los permisos de ruta y token en el despliegue integrado con Eureka y Gateway.
- El listener de comandos de hold está apagado por defecto (`app.holds.commands.enabled=false` y `accounting.messaging.consumers-enabled=false`). La documentación del equipo afirma que no se puede encender sin un `HoldReplyResender` de producción; esa afirmación está en disputa.
- `PURCHASE_CONFIRMED` no lo consume nadie; `AccountCoinReservationsPort` no está implementado.
- Ramas sin integrar en Accounting: la rama `lives-purchase-credit` dio origen al acuerdo del 2026-10-02 formalizando `LIFE_PURCHASE_CONFIRMED`; restan `life-holds-challenge-reservation` y `life-holds-expiration`.
- Se necesita un reembolso que hoy no existe (ver D6 en [[Taller de decisiones]]).
- **Revocación de ítems no ratificada ni desplegada:** Accounting no tiene aún implementado el consumidor de `ITEM_REVOKE_REQUESTED` ni las respuestas `ITEM_REVOKED` / `ITEM_REVOKE_FAILED`.
- **Falta de evento de error de crédito:** Accounting manda al DLT sin evento cuando falla la acreditación de ítems; `ITEM_CREDIT_FAILED` es una propuesta de Mercado aún no ratificada.

## Acuerdos y tareas pendientes

- **Orden de la saga:** Decidido formalmente en [[DEC-025 - Saga de compra de ítems según la Propuesta C]] para compras directas de ítems. Cierra [[Q-008 - Orden de la saga de compra]] (archivada).
- **Ratificación del contrato de revocación:** Accounting debe ratificar e implementar `ITEM_REVOKE_REQUESTED`, soportando idempotencia ("nada que revocar", `revoked_item_count = 0`) y bloqueo de acreditaciones tardías para órdenes revocadas.
- **Ratificación de esquemas de respuesta:** Respuestas propuestas de Accounting (`ITEM_CREDIT_FAILED`, `ITEM_REVOKED`, `ITEM_REVOKE_FAILED`) pendientes de ratificación por Tema 08.
- **Implementación en Mercado (mergeada en `develop@d3b7a4de`):**
  - T05 (PR #188): Consumo de `ITEM_CREDIT_FAILED` (cancelación sin revocar y liberación de hold) y respuestas de revocación (`ITEM_REVOKED` idempotente e `ITEM_REVOKE_FAILED` con marca de revisión `review_reason = 'ITEM_REVOKE_FAILED'`, bandera booleana independiente `revoke_failed = true` y métrica `market.purchase.revoke_failed{reason}`). Ratificación de Accounting pendiente.
  - T08 (PR #187): Detección de crédito insuficiente en compras de vidas (`LIFE_CREDITED`) para marcar revisión administrativa con `review_reason = 'LIFE_CREDIT_SHORTFALL'`. La saga completa de vidas (crédito antes de débito) se difiere para el próximo sprint; no existe acuerdo de saga completa de vidas este sprint.
  - T02 (PR #189): Emisión de `ITEM_CONFIRMED` en `market.events` con UUID canónico `orderRef`.
  - Wire format Kafka (PR #186): Migración completa a `snake_case` según `contratos-kafka v8`.
- **Scripts SQL manuales de base de datos:** Antes del deploy a entornos con PostgreSQL deben ejecutarse manualmente los 3 scripts SQL ubicados en `db/manual/` para actualizar las restricciones y columnas de la tabla `orders`:
  1. `US7697__order_review_reason.sql`: agrega la columna `review_reason` y su restricción `CHECK`.
  2. `US7697__orders_cancellation_reason_check.sql` (T03): amplía la restricción `CHECK` de motivos de cancelación para admitir `CONFIRMATION_DEADLINE_EXCEEDED`.
  3. `US7697__orders_revoke_failed_flag.sql` (T05): agrega la bandera booleana `revoke_failed` en la tabla `orders`.
- **Comunicar a Accounting** que las subastas usan un release por postor y no por `orderId` ([[DEC-014 - Reglas de subastas]]). Las ofertas superadas mantienen su hold hasta el cierre de la subasta.
- **Acuerdos de compra de vidas del 2026-10-04**: validación preventiva del tope, `orderId` unificado y `LIFE_PURCHASE_REJECTED` ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[S2-11 - Acuerdos de compra de vidas con Accounting]]). Implementados en Mercado; falta que Accounting publique `LIFE_PURCHASE_REJECTED` y confirmar cómo se emite el token de servicio.
- **Señal de compra de vidas y tope**: Acordada formalmente el 2026-10-02 (enmienda a [[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]]): Mercado emite `LIFE_PURCHASE_CONFIRMED` en `market.events` tras confirmar el hold de monedas; Accounting acredita hasta el tope y reporta el resultado con `LIFE_CREDITED` en `accounting.events`.
- Pedidos ya listados del [[Taller de decisiones]] que no cubre la decisión de contrato: `HOLD_EXPIRED` confiable (D4), aceptar cualquier `catalogItemId` (D10) y reembolso (D6).
- Propuestas que exigen cambios en accounting: [[Meta colectiva (Colecta)]] y [[Cofres y nuevos ítems]].

## Relacionado
[[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Propuesta C de la saga de compra]], [[Eventos y Kafka]], [[Hold y escrow]], [[Orden de compra]], [[Hold de monedas]], [[Tipos de item]], [[Épica 131 - Inventario (otro equipo)]], [[Mapa de servicios]].
