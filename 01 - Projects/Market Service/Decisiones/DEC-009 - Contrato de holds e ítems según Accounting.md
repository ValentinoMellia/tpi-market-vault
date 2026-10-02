---
tipo: decision
estado: vigente
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, accounting, contrato, hold]
---
# DEC-009 - Contrato de holds e ítems según Accounting

> Mercado adopta el contrato de Accounting para holds y entrega de ítems, tal como lo define su código más el mensaje del 2026-10-01. **Excluye el orden de la compra** (cobrar o entregar primero), que sigue abierto en [[Q-008 - Orden de la saga de compra]].

## Contexto
Mercado asumió un contrato (`commandId`, `ttlSeconds`, release en lote, `orderId` numérico, tópicos propios) que difiere del que Accounting implementa. En su propio lado manda el código de Accounting (jerarquía de verdad, rango 4). Pregunta de origen: [[Q-007 - Contrato con Accounting]].

## Decisión
Decidida por el líder del equipo de Mercado el 2026-10-01. Mercado se alinea a:

| Punto | Contrato adoptado |
|---|---|
| Tópico de holds | `accounting.events` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]) |
| `orderId` | UUID canónico, generado por Mercado y persistido como `orderRef`; un hold por `orderId` para siempre |
| Correlación | El `eventId` del comando; la respuesta trae `correlationId` |
| Confirmación | Solo `holdId`, sin monto; el hold no lleva moneda |
| Rechazo | `HOLD_REJECTED {reason, message}`; Mercado usa `INSUFFICIENT_BALANCE` y **debe mapear todos** los motivos: `ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND` |
| Motivos de release | `AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED` |
| TTL | Lo fija Accounting para `DIRECT_PURCHASE` (300 s); Mercado no depende de `ttlSeconds` |
| `orderType` | `DIRECT_PURCHASE` o `AUCTION_BID` |
| Entrega del ítem | Mercado publica `ITEM_CONFIRMED` en `market.events`; Accounting responde `ITEM_CREDITED` (con `sourceReferenceId` = `orderId`) en `accounting.events` |
| Aumento de hold (subastas) | `HOLD_INCREASE_REQUESTED` envía el **total nuevo**, no la diferencia |
| Consulta de estado | `GET /api/accounting/holds/{holdId}`, que Accounting implementa este sprint |

Los detalles de campos están en [[Integración con Accounting]].

## Alternativas descartadas
- **Mantener el contrato de Mercado y pedir a Accounting que se alinee**: Accounting ya lo implementó y no hay margen sin acuerdo.
- **Un comando único `PURCHASE_SETTLEMENT_REQUESTED`**: ningún lado lo implementa ([[Ideas descartadas]]).

## Excluido de esta decisión
- **El orden de la compra** (`ITEM_CONFIRMED` antes o después de `HOLD_CONFIRM_REQUESTED`) y su compensación: sigue en [[Q-008 - Orden de la saga de compra]].
- La liberación de subastas (por postor o por `orderId`): se decidió en [[DEC-014 - Reglas de subastas]] (un release por postor; [[Q-012 - Alcance de subastas]] archivada).
- Los pedidos que Mercado hace a Accounting y no están acordados (`HOLD_EXPIRED` confiable, aceptar cualquier `catalogItemId`, reembolso, D4, D6 y D10 del [[Taller de decisiones]]).

## Consecuencias
- Tareas de código en [[Roadmap de trabajo]]: `orderRef` UUID como `orderId`, mapeo de todos los motivos de rechazo, `BankHoldQueryClient` real al integrarse la consulta, `HOLD_INCREASED` y envío del total nuevo (Fase 3).
- El `ITEM_CONFIRMED` hacia `market.events` reemplaza a los mensajes `ITEM_PROVISION_*` de un inventario que no existe; su activación depende del orden de la compra.
- Qué ve el estudiante ante cada motivo de rechazo queda por definir con producto.

## Notas afectadas
[[Integración con Accounting]], [[Hold de monedas]], [[Eventos y Kafka]], [[Orden de compra]], [[Estado actual del código]], [[Subasta]], [[Roadmap de trabajo]], [[Taller de decisiones]], [[Decisiones - Índice]].
