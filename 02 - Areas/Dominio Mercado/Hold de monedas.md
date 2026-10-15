---
tipo: entidad
estado: vigente
verificado_contra: DEC-025, codigo@d3b7a4de
actualizado: 2026-10-12
tags: [mercado, dominio, hold, accounting]
---
# Hold de monedas

> Retención temporal de monedas del estudiante que hace Accounting (ex Banco) mientras se completa la compra. Se confirma (débito) o se libera (devolución). Mercado lo pide pero no lo administra; el orden de la compra se rige por [[DEC-025 - Saga de compra de ítems según la Propuesta C]].

Actualización (2026-10-09): lo que esta nota dice del código de Mercado se verificó contra `e456c55f` (PR #102, #110, #115 y #116). Lo que dice del código de Accounting sigue verificado contra su `develop` del 2026-10-01: no se reverificó.

## Qué representa
Un compromiso de Accounting de reservar el monto de la compra. Mercado guarda su `holdId` y su vencimiento en la [[Orden de compra]]. Concepto general: [[Hold y escrow]].

## Datos principales
| Campo | Significado |
|---|---|
| `holdId` | Identificador entregado por Accounting |
| `holdExpiresAt` | Vencimiento fijado por Accounting (guardado como `LocalDateTime` con la hora UTC desde el PR #118 de `tpi-market`, T02 de [[S2-05 - Robustez de la compra]], mergeado en `develop` el 2026-10-06 (`cb12210a`, aprobado y mergeado por tommikimmel); antes, en la zona del sistema) |
| `BankHoldStatus` | `PENDING`, `COMMITTED`, `RELEASED`, `UNKNOWN` (consultado vía `GET /api/accounting/holds/{holdId}` con `HttpBankHoldQueryClient`, PR #116) |
| Motivo de liberación | `BankHoldReleaseReason` en Mercado (enum tipado restringido a los 3 valores canónicos: `AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`; PR #115, US-5193 T08, `5de30854`); coincide exactamente con el contrato de Accounting |
| `orderType` | `DIRECT_PURCHASE` o `AUCTION_BID` |

## Ciclo de vida / estados
Pedido (`HOLD_CREATE_REQUESTED`), creado (`HOLD_CREATED`) o rechazado (`HOLD_REJECTED`), confirmado (`HOLD_CONFIRMED`), liberado (`HOLD_RELEASED`) o vencido (`HOLD_EXPIRED`). Para subastas existe además `HOLD_INCREASE_REQUESTED` y `HOLD_INCREASED`.

## Reglas de negocio
- En la compra directa de ítems se retiene primero, se acredita el ítem y recién después se confirma el hold (`HOLD_CONFIRM_REQUESTED`); si la confirmación falla o vence el plazo, se revoca el ítem y se libera el hold ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]).
- La confirmación lleva `hold_id`, sin monto.
- Accounting fija el TTL: 300 s para `DIRECT_PURCHASE` (ignora `ttl_seconds`); en `AUCTION_BID` es obligatorio y mayor que 0.
- Un hold por `order_id` para siempre (`UNIQUE(account_id, order_id)`); no hay liberación en lote ni captura parcial.
- Consulta de estado implementada (PR #116, issue #114, `e456c55f`): `HttpBankHoldQueryClient` consume `GET /api/accounting/holds/{holdId}` bajo transporte `kafka` con token dinámico (`IdentityServiceTokenClient`), alias tolerantes a `camelCase` / `snake_case` y timeouts configurables.
- `orderId` debe ser UUID canónico, o accounting rechaza el comando con `MALFORMED_COMMAND`. Desde el PR #88 (`develop` en `349c8e2`) Mercado envía el `orderRef` UUID de la orden (`services/impl/OrderHoldServiceImpl.java:100`; [[Orden de compra]], [[Integración con Accounting]]).
- Mercado mapea los 10 motivos de rechazo del contrato de Accounting (`OrderRejectionReason`, PR #110, US-5193 T07, `f7457882`): solo `INSUFFICIENT_BALANCE` / `INSUFFICIENT_FUNDS` transiciona a `REJECTED_INSUFFICIENT_FUNDS`; los otros nueve motivos (`ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`) y los códigos no reconocidos (fallback a `PROVISION_FAILED`) pasan a `REJECTED` registrando su causa en la orden (`OrderEntity.rejectionReason`) y liberando el stock reservado ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[Estado actual del código]], gap 22 cerrado).
- Liberación con enum tipado (PR #115, US-5193 T08, `5de30854`): `BankHoldReleaseReason` coincide de forma estricta con los 3 valores de Accounting (`AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`); `fromWireCode` devuelve `Optional<BankHoldReleaseReason>` y `BankHoldReleaseRequestDto` exige enum tipado no nulo en su constructor compacto. `OrderItemProvisionServiceImpl` libera con `PURCHASE_NOT_COMPLETED`, y `OrderHoldServiceImpl.expireGrantedHold` ya no emite liberación redundante si el hold expiró localmente.
- Recepción de `HOLD_RELEASED` sin `correlation_id` (PR #116, issue #114, `e456c55f` y T04 en `develop@d3b7a4de`): cuando Accounting emite liberaciones asíncronas externas (por baja de alumno o archivo de curso), `AccountingHoldEventHandler` resuelve la orden por `hold_id` y ejecuta la compensación. Si la orden está en `HOLD_GRANTED`, transiciona a `EXPIRED` liberando stock; si está en `ITEM_PROVISION_REQUESTED`, cancela la orden liberando stock; y si está en `ITEM_PROVISIONED`, ejecuta rollback completo emitiendo `ITEM_REVOKE_REQUESTED` y liberando stock ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]), sustituyendo la retención de DEC-019.
- Contrato adoptado: [[DEC-009 - Contrato de holds e ítems según Accounting]]; transporte solo por Kafka: [[DEC-003 - Holds solo por Kafka]]. Orden de la saga de compra adoptado por [[DEC-025 - Saga de compra de ítems según la Propuesta C]] (cierra [[Q-008 - Orden de la saga de compra]] archivada).
- Con holds, las monedas no se debitan hasta `HOLD_CONFIRM_REQUESTED`: antes de confirmar, devolver las monedas es liberar el hold.
- Todos los comandos de hold se publican con productor `market-service` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Al compartir `accounting.events`, `AccountingHoldKafkaListener` descarta los comandos propios sin enviarlos a DLT ni generar excepciones (PR #102, US-5193 T03 y T04, `2485d8cf`; [[Eventos y Kafka]]).

## Dónde vive en el código
`dtos/bank/*`, `clients/impl/OutboxBankHoldClient.java`, `clients/impl/HttpBankHoldQueryClient.java`, `clients/impl/IdentityServiceTokenClient.java`, `services/impl/OrderHoldServiceImpl.java`, `listeners/AccountingHoldEventHandler.java`.

## Relacionado
[[Integración con Accounting]], [[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Subasta]] (retención por oferta), [[Saga]].
