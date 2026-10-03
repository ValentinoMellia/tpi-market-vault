---
tipo: integracion
estado: en-disputa
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-03
tags: [mercado, integracion, accounting, banco, inventario, kafka]
---
# Integración con Accounting

> Accounting (ex Banco, Tema 08, grupo G12 en Taiga) es el dueño de las monedas, las vidas y el inventario del estudiante. Mercado le pide retener, confirmar o liberar monedas y le avisa qué item se compró. El código de Mercado y el de accounting hoy **no hablan el mismo contrato**: Mercado decidió adoptar el de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]]) y falta implementarlo. Lo único en disputa es el orden de la compra: [[Q-008 - Orden de la saga de compra]].

## Decisiones que gobiernan esta integración

| Decisión | Qué fija |
|---|---|
| [[DEC-001 - Accounting es dueño del inventario]] | El inventario es de Accounting |
| [[DEC-003 - Holds solo por Kafka]] | Holds solo por Kafka; la única lectura REST es la consulta de estado |
| [[DEC-007 - Tope de vidas, Accounting decide y reporta]] | Accounting aplica el tope y reporta; Mercado reacciona y no valida |
| [[DEC-008 - Nombre de productor y tópicos de Mercado]] | `market-service`, `market.events` y `accounting.events`, `SNAKE_CASE` en inglés |
| [[DEC-009 - Contrato de holds e ítems según Accounting]] | Contrato de holds e ítems de Accounting (no incluye el orden de la compra) |
| [[DEC-010 - Los efectos de los ítems no son de Mercado]] | Escudos en Accounting, multiplicadores en el motor de desafíos |
| [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] | Los ítems no vencen |
| [[DEC-014 - Reglas de subastas]] | Un release por postor al cancelar o cerrar una subasta; sin release por `orderId` |

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

Un solo tópico, `accounting.events` (más `accounting.events.DLT`), para comandos y respuestas. La clave de correlación es el `eventId` del comando: las respuestas lo devuelven como `correlationId`.

| Comando (Mercado a accounting) | Campos |
|---|---|
| `HOLD_CREATE_REQUESTED` | `studentId`, `courseId`, `orderId` (UUID canónico), `orderType` (`DIRECT_PURCHASE` o `AUCTION_BID`), `amount`, `ttlSeconds` |
| `HOLD_INCREASE_REQUESTED` | `holdId`, `newTotalAmount` |
| `HOLD_CONFIRM_REQUESTED` | `holdId` |
| `HOLD_RELEASE_REQUESTED` | `holdId`, `releaseReason` (`AUCTION_LOST`, `AUCTION_CANCELLED` o `PURCHASE_NOT_COMPLETED`) |

- `ttlSeconds` se ignora para `DIRECT_PURCHASE` (accounting usa 300 s fijos) y es obligatorio y mayor que 0 para `AUCTION_BID`.
- Respuestas: `HOLD_CREATED`, `HOLD_INCREASED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `HOLD_REJECTED {correlationId, holdId, reason, message}` y `HOLD_EXPIRED` (declarado; el documento del equipo discute si el planificador de vencimiento existe).
- Motivos de rechazo: `ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INSUFFICIENT_BALANCE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`.
- Restricción `UNIQUE(account_id, order_id)`: **un hold por `orderId` para siempre**. No hay liberación en lote ni captura parcial.
- Con esto queda confirmado que `DIRECT_PURCHASE` es un `orderType` válido y que la confirmación no lleva monto ni el hold lleva moneda.

## Entrega del item

| Dirección | Mensaje | Tópico | Campos |
|---|---|---|---|
| Mercado a accounting | `ITEM_CONFIRMED` | `market.events` | `studentId`, `courseId`, `orderId`, `catalogItemId`, `itemName`, `itemType`, `effect` |
| Accounting a Mercado | `ITEM_CREDITED` | `accounting.events` | `studentId`, `courseId`, `itemInstanceId`, `itemName`, `itemType`, `sourceReferenceId` (= `orderId`); no trae `correlationId` |

- No existen los eventos `ITEM_PROVISION_*`. Si acreditar falla, hay reintentos y luego DLT; **no se publica ningún evento de falla**.
- `InventoryCatalog` solo acepta `ITEM-PLACEHOLDER-1` a `ITEM-PLACEHOLDER-3`; cualquier otro `catalogItemId` va a DLT. Las cargas máximas (`max_charges`) están fijas ahí y el ámbito se guarda `NULL` (equivale a `ALL`).

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
| `GET /{studentId}/equip-summary` | MS, ADMIN, STUDENT |
| `POST /courses/{courseId}/challenge-reservations` | MS (motor de desafíos) |

## Vidas

El tope PAR-12 viene de Backoffice (evento `GLOBAL_CONFIGURATION_CHANGED {initialLives, maxLives}` en `administration.events`, valores por defecto 3 y 3, ver [[Integración con Backoffice]]). Accounting **recorta (clamp), nunca rechaza**: el crédito se trunca y queda una fila de libro con `delta` 0. `LIFE_PURCHASE_CONFIRMED` solo existe en la rama sin integrar `feature/lives-purchase-credit` (propuesta).

Decisión ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]): Mercado **no valida** el tope. Accounting aplica su regla (hoy el recorte, PAR-12) y reporta el resultado de una compra de vida con tope alcanzado; Mercado reacciona (por ejemplo, libera el hold o lo refleja en el estado de la orden). **A acordar con Accounting**: el evento y el motivo exactos que publicará para ese caso; hasta entonces Mercado no implementa el manejo ([[Roadmap de trabajo]]). Pregunta de origen: [[Q-002 - Vidas y tope de vidas]].

## Diferencias entre el código de Mercado y el de accounting

Mercado se alinea a la columna de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-008 - Nombre de productor y tópicos de Mercado]]), salvo el orden de la saga, que sigue abierto.

| Tema | Mercado hoy | Accounting |
|---|---|---|
| Tópicos de holds | `accounting.holds.commands` y `accounting.holds.events` | `accounting.events` |
| Tópico propio | `market.orders.events` | `market.events` |
| Provisión | `ITEM_PROVISION_REQUESTED`, `ITEM_PROVISIONED`, `ITEM_PROVISION_FAILED` en `inventory.items.*` | `ITEM_CONFIRMED` (en `market.events`) y luego `ITEM_CREDITED` (en `accounting.events`); falla silenciosa a DLT |
| Orden de la saga | provisión, luego confirmar débito | confirmar débito, luego `ITEM_CONFIRMED` ([[Q-008 - Orden de la saga de compra]]) |
| `orderId` | numérico | UUID canónico |
| Correlación del item | `correlationId` | `sourceReferenceId` = `orderId` |
| `PURCHASE_CONFIRMED` | se publica | nadie lo consume |
| Consulta de hold | necesaria para reconciliar | en implementación este sprint (ver abajo) |
| Catálogo | plantillas `tpl-*` | solo `ITEM-PLACEHOLDER-1` a `3` |

Los motivos de rechazo y de release **no** figuran como diferencia: Mercado ya traduce `OrderRejectionReason.INSUFFICIENT_FUNDS` al código de cable `INSUFFICIENT_BALANCE` (y `LIFE_CAP_REACHED` a `MAX_LIVES_REACHED`) en `src/main/java/ar/edu/utn/frc/tup/p4/models/enums/OrderRejectionReason.java:33`, y siempre libera con `PURCHASE_NOT_COMPLETED` (`services/impl/OrderItemProvisionServiceImpl.java:62`). Lo que sí falta es el manejo de los demás motivos de rechazo (ver abajo).

El plan de alineación está en [[Roadmap de trabajo]] (P0).

**Estado al 2026-10-03** (código de Mercado, no el de Accounting, que no se volvió a leer):

- **PR #88 (abierta, no mergeada)** implementa dos filas de la tabla: `orderId` UUID (`orderRef` persistido, usado como `orderId` del hold; las órdenes sin `orderRef` siguen enviando el id numérico) y los tópicos por defecto `accounting.events` y `market.events`. No cambia el productor ni los mensajes `ITEM_PROVISION_*`, ni descarta los comandos propios en el tópico compartido. Ver [[Revisión de PRs abiertas (2026-10-03)]].
- **PR #78 (mergeada)**: Mercado ya publica `LIFE_PURCHASE_CONFIRMED` en `market.events`. La sección «Vidas», más arriba, lo describe como "solo en una rama sin integrar" del lado de Accounting; no se verificó si ya lo consume.

## Mensaje de accounting del 2026-10-01 y estado

Accounting envió siete puntos. Estado de cada uno contra el código de Mercado (`codigo@7528610`):

| # | Pedido de accounting | Estado en Mercado |
|---|---|---|
| 1 | Apuntar los tópicos de holds a `accounting.events` | Posible sin cambiar código: los tópicos se configuran con `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_EVENTS` (`src/main/resources/application.properties:38-39`). **Riesgo a verificar**: con un tópico compartido, el listener de Mercado también recibe sus propios comandos; hay que confirmar que se ignoran y no terminan en DLT como mensajes malformados o desconocidos |
| 2 | `orderId` UUID canónico (**bloqueante**) | No cumple: Mercado envía el id numérico y todo `HOLD_CREATE_REQUESTED` se rechazaría con `MALFORMED_COMMAND`. Decidido: `orderRef` UUID persistido (D8 del [[Taller de decisiones]], [[DEC-009 - Contrato de holds e ítems según Accounting]]). Es P0 en [[Roadmap de trabajo]] |
| 3 | `HOLD_INCREASE_REQUESTED` (envía el **total nuevo**, no la diferencia) | No implementado; las subastas son Fase 3 ([[Subasta]], [[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]) |
| 4 | Cancelar una subasta con `HOLD_RELEASE_REQUESTED` por `orderId`, sin `holdId`, con `AUCTION_CANCELLED`, liberando todos los holds de la orden | **No adoptado** ([[DEC-014 - Reglas de subastas]]): Mercado envía **un `HOLD_RELEASE_REQUESTED` por postor** (con `holdId`). **A comunicar a Accounting**; es coherente con su restricción de un hold por `orderId` y sin liberación en lote |
| 5 | Mercado debe manejar `ACCOUNT_INACTIVE`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND` y el payload de `HOLD_INCREASED` | **Brecha real**: Mercado solo reconoce `INSUFFICIENT_BALANCE` y `MAX_LIVES_REACHED`. Cualquier otro motivo cae en `REJECTED_INSUFFICIENT_FUNDS` con un log de advertencia (`services/impl/OrderHoldServiceImpl.java`, `applyRejection`, cerca de la línea 130), por lo que el estudiante vería "saldo insuficiente" aunque su cuenta esté inactiva. `HOLD_INCREASED` no se maneja (Fase 3) |
| 6 | Deduplicar respuestas reenviadas (misma `correlationId`) | Sí, en dos capas: deduplicación por `eventId` en `processed_events` y guarda de estado (los manejadores ignoran un evento si la orden no está en el estado esperado, p. ej. `services/impl/OrderConfirmationServiceImpl.java`, cerca de la línea 385). Ver [[Entrega at-least-once y deduplicación]] |
| 7 | `GET /api/accounting/holds/{holdId}` en implementación este sprint; avisarán al integrarlo para encender `bank-hold.reconciliation` | Pendiente de accounting. Al integrarse: implementar el `BankHoldQueryClient` real (también corrige el fallo de arranque con `kafka`) y encender `bank-hold.reconciliation.enabled`. Ver [[Q-007 - Contrato con Accounting]] |

El mensaje **no menciona** el orden de la saga ([[Q-008 - Orden de la saga de compra]]) ni `ITEM_CONFIRMED` e `ITEM_CREDITED`: sigue siendo la conversación principal pendiente con accounting.

Postura de Mercado (2026-10-01, no es una decisión): preferir **entregar el ítem primero**, porque revertir un ítem del inventario se considera más viable que devolver monedas. Con holds, las monedas no se debitan hasta `HOLD_CONFIRM_REQUESTED`, así que antes de confirmar devolver monedas es liberar el hold. El riesgo real es que la confirmación falle después de entregar, y eso exige que Accounting soporte la **revocación de un ítem**, que hoy no existe (no hay REST ni evento para quitar un ítem). Pedido a Accounting: revocación de ítem y evento de error al fallar el acreditado. Detalle en [[Q-008 - Orden de la saga de compra]].

## Estado actual en el código de Mercado

Implementado con [[Patrón Outbox]]: `clients/impl/OutboxBankHoldClient.java` y `OutboxInventoryItemProvisionClient.java`; listeners `AccountingHoldKafkaListener` e `InventoryItemKafkaListener`, solo con transporte `kafka`. Con `mock` responden `MockBankHoldClient` y `MockInventoryItemProvisionClient`. `BankHoldQueryClient` solo existe simulado. Los nombres de clase conservan "Bank" por historia ([[Estado actual del código]]).

## Brechas del lado de accounting

- No existe todavía consulta REST del estado de un hold de monedas (solo `GET /life-holds/{id}`); `GET /api/accounting/holds/{holdId}` está en implementación este sprint, según su mensaje del 2026-10-01.
- El listener de comandos de hold está apagado por defecto (`app.holds.commands.enabled=false` y `accounting.messaging.consumers-enabled=false`). La documentación del equipo afirma que no se puede encender sin un `HoldReplyResender` de producción; esa afirmación está en disputa.
- `PURCHASE_CONFIRMED` no lo consume nadie; `AccountCoinReservationsPort` no está implementado.
- Ramas sin integrar: `lives-purchase-credit`, `life-holds-challenge-reservation` y `life-holds-expiration`.
- Se necesita un reembolso que hoy no existe (ver D6 en [[Taller de decisiones]]).

## Acuerdos pendientes

- **Orden de la saga** y su compensación: [[Q-008 - Orden de la saga de compra]] (abierta). Incluye pedir la revocación de ítems.
- **Comunicar a Accounting** que las subastas usan un release por postor y no por `orderId` ([[DEC-014 - Reglas de subastas]]). Las ofertas superadas mantienen su hold hasta el cierre de la subasta.
- **Señal del tope de vidas**: evento y motivo que Accounting publicará para una compra de vida con tope alcanzado ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]).
- Pedidos ya listados del [[Taller de decisiones]] que no cubre la decisión de contrato: `HOLD_EXPIRED` confiable (D4), aceptar cualquier `catalogItemId` (D10) y reembolso (D6).
- Alineación del código de Mercado: tópicos, `orderRef` UUID, mapeo de motivos de rechazo, consulta de hold ([[Roadmap de trabajo]]).
- Propuestas que exigen cambios en accounting: [[Meta colectiva (Colecta)]] y [[Cofres y nuevos ítems]].

## Relacionado
[[Eventos y Kafka]], [[Hold y escrow]], [[Orden de compra]], [[Hold de monedas]], [[Tipos de item]], [[Épica 131 - Inventario (otro equipo)]], [[Mapa de servicios]].
