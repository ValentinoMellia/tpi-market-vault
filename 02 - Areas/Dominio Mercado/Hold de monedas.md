---
tipo: entidad
estado: en-disputa
verificado_contra: codigo@5de30854
actualizado: 2026-10-09
tags: [mercado, dominio, hold, accounting]
---
# Hold de monedas

> Retención temporal de monedas del estudiante que hace Accounting (ex Banco) mientras se completa la compra. Se confirma (débito) o se libera (devolución). Mercado lo pide pero no lo administra; el orden de la compra sigue en disputa ([[Q-008 - Orden de la saga de compra]]).

## Qué representa
Un compromiso de Accounting de reservar el monto de la compra. Mercado guarda su `holdId` y su vencimiento en la [[Orden de compra]]. Concepto general: [[Hold y escrow]].

## Datos principales
| Campo | Significado |
|---|---|
| `holdId` | Identificador entregado por Accounting |
| `holdExpiresAt` | Vencimiento fijado por Accounting (guardado como `LocalDateTime` con la hora UTC desde el PR #118 de `tpi-market`, T02 de [[S2-05 - Robustez de la compra]], mergeado en `develop` el 2026-10-06 (`cb12210a`, aprobado y mergeado por tommikimmel); antes, en la zona del sistema) |
| `BankHoldStatus` | `PENDING`, `COMMITTED`, `RELEASED`, `UNKNOWN` (consulta de estado, que accounting no ofrece) |
| Motivo de liberación | `BankHoldReleaseReason` en Mercado (enum tipado restringido a los 3 valores canónicos: `AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`; PR #115, US-5193 T08, `5de30854`); coincide exactamente con el contrato de Accounting |
| `orderType` | `DIRECT_PURCHASE` o `AUCTION_BID` |

## Ciclo de vida / estados
Pedido (`HOLD_CREATE_REQUESTED`), creado (`HOLD_CREATED`) o rechazado (`HOLD_REJECTED`), confirmado (`HOLD_CONFIRMED`), liberado (`HOLD_RELEASED`) o vencido (`HOLD_EXPIRED`). Para subastas existe además `HOLD_INCREASE_REQUESTED` y `HOLD_INCREASED`.

## Reglas de negocio
- Hoy el código confirma el hold solo después de provisionar el item; el orden está en disputa ([[Q-008 - Orden de la saga de compra]]).
- La confirmación lleva `holdId`, sin monto.
- Accounting fija el TTL: 300 s para `DIRECT_PURCHASE` (ignora `ttlSeconds`); en `AUCTION_BID` es obligatorio y mayor que 0.
- Un hold por `orderId` para siempre (`UNIQUE(account_id, order_id)`); no hay liberación en lote ni captura parcial.
- Accounting aún no ofrece consulta del estado de un hold de monedas: `GET /api/accounting/holds/{holdId}` está en implementación este sprint (D5) y el listener de comandos está apagado por defecto.
- `orderId` debe ser UUID canónico, o accounting rechaza el comando con `MALFORMED_COMMAND`. Desde el PR #88 (`develop` en `349c8e2`) Mercado envía el `orderRef` UUID de la orden (`services/impl/OrderHoldServiceImpl.java:100`; [[Orden de compra]], [[Integración con Accounting]]).
- Mercado mapea los 10 motivos de rechazo del contrato de Accounting (`OrderRejectionReason`, PR #110, US-5193 T07, `f7457882`): solo `INSUFFICIENT_BALANCE` / `INSUFFICIENT_FUNDS` transiciona a `REJECTED_INSUFFICIENT_FUNDS`; los otros nueve motivos (`ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`) y los códigos no reconocidos (fallback a `PROVISION_FAILED`) pasan a `REJECTED` registrando su causa en la orden (`OrderEntity.rejectionReason`) y liberando el stock reservado ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[Estado actual del código]], gap 22 cerrado).
- Liberación con enum tipado (PR #115, US-5193 T08, `5de30854`): `BankHoldReleaseReason` coincide de forma estricta con los 3 valores de Accounting (`AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`); `fromWireCode` devuelve `Optional<BankHoldReleaseReason>` y `BankHoldReleaseRequestDto` exige enum tipado no nulo en su constructor compacto. `OrderItemProvisionServiceImpl` libera con `PURCHASE_NOT_COMPLETED`, y `OrderHoldServiceImpl.expireGrantedHold` ya no emite liberación redundante si el hold expiró localmente.
- Contrato adoptado: [[DEC-009 - Contrato de holds e ítems según Accounting]]; transporte solo por Kafka: [[DEC-003 - Holds solo por Kafka]]. Lo único en disputa de esta nota es el orden de la compra ([[Q-008 - Orden de la saga de compra]]).
- Con holds, las monedas no se debitan hasta `HOLD_CONFIRM_REQUESTED`: antes de confirmar, devolver las monedas es liberar el hold.
- Todos los comandos de hold se publican con productor `market-service` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Al compartir `accounting.events`, `AccountingHoldKafkaListener` descarta los comandos propios sin enviarlos a DLT ni generar excepciones (PR #102, US-5193 T03 y T04, `2485d8cf`; [[Eventos y Kafka]]).

## Dónde vive en el código
`dtos/bank/*`, `clients/impl/OutboxBankHoldClient.java`, `services/impl/OrderHoldServiceImpl.java`, `listeners/AccountingHoldEventHandler.java`.

## Relacionado
[[Integración con Accounting]], [[Subasta]] (retención por oferta), [[Saga]].
