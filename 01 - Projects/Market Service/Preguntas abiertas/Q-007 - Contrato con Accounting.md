---
tipo: pregunta
estado: archivado
verificado_contra: DEC-009
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, accounting, banco]
---
# Q-007 - Contrato con Accounting

> Diferencias entre lo que Mercado asumió y lo que el código de Accounting (ex Banco) define para los holds y la entrega del item. Tras leer su código, varios puntos se resolvieron; quedan los de abajo. **Resuelta**: Mercado adopta el contrato de Accounting, salvo el orden de la compra ([[Q-008 - Orden de la saga de compra]], abierta). Ver [[DEC-009 - Contrato de holds e ítems según Accounting]].

## Qué se contradice
| Punto | Mercado (código y documentos anteriores) | Accounting (código `develop`) |
|---|---|---|
| Correlación | `commandId` | No hay `commandId`: el `eventId` del comando es la correlación; las respuestas traen `correlationId` |
| Confirmación | Con monto | Sin monto: solo `holdId` |
| Rechazo | Ya mapea `INSUFFICIENT_FUNDS` (enum) al código de cable `INSUFFICIENT_BALANCE`; los demás motivos caen en `REJECTED_INSUFFICIENT_FUNDS` | `INSUFFICIENT_BALANCE` y otros nueve motivos, con campos `reason` y `message` |
| Motivos de release | Siempre `PURCHASE_NOT_COMPLETED` | `AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED` (sin diferencia hoy) |
| TTL | `ttlSeconds` 300 más gracia | Ignorado en `DIRECT_PURCHASE` (300 s fijos); obligatorio en `AUCTION_BID` |
| Clave de partición | `studentId` | `studentId:courseId` |
| Release | En lote | Uno por hold (no hay lote) |
| Extensión | `HOLD_EXTEND` | `HOLD_INCREASE_REQUESTED` (aumenta el monto, no el plazo) |
| `orderType` | `DIRECT_PURCHASE` (adivinado) | Confirmado: `DIRECT_PURCHASE` o `AUCTION_BID` |
| `orderId` | Numérico (**bloqueante**: accounting rechazaría todo `HOLD_CREATE_REQUESTED` con `MALFORMED_COMMAND`) | UUID canónico; un hold por `orderId` para siempre |
| Consulta de estado | `GET` de hold para reconciliar | En implementación este sprint (`GET /api/accounting/holds/{holdId}`); sin fecha de merge |
| Moneda | Campo `currency` | No existe |
| Tópicos | `accounting.holds.*` | `accounting.events` ([[Q-006 - Naming de eventos y topics]]) |

La tabla completa de diferencias, incluida la entrega del item, está en [[Integración con Accounting]].

## Recomendaciones del taller del equipo
- **D4**: Accounting expira los holds y publica `HOLD_EXPIRED`.
- **D5**: Accounting expone `GET /holds/{holdId}` para Mercado (hoy no existe).
- **D6**: sin reembolso por ahora; si hace falta, lo resuelve un ADMIN manualmente.
- **D8**: Mercado genera un `orderRef` UUID y lo persiste (hoy el `orderId` es numérico).
- **D10**: Accounting acepta cualquier `catalogItemId` y toma las cargas del payload (hoy solo acepta `ITEM-PLACEHOLDER-1` a `3`).

Ver [[Taller de decisiones]]. Ninguna está formalmente decidida.

## Mensaje de accounting del 2026-10-01
Accounting confirmó que `orderId` debe ser UUID (D8 deja de ser solo una recomendación: es requisito para que funcione cualquier hold), propuso unificar los tópicos en `accounting.events` (Mercado lo puede configurar por variables de entorno, con el riesgo de recibir sus propios comandos) y anunció que implementa la consulta de holds este sprint. Punto por punto en [[Integración con Accounting]].

## Qué hace hoy el código de Mercado
Sigue en parte el contrato: usa `correlationId`, no envía monto en la confirmación ni moneda en `HOLD_CREATE`, traduce `INSUFFICIENT_FUNDS` a `INSUFFICIENT_BALANCE` en el cable y libera siempre con `PURCHASE_NOT_COMPLETED`. Pero usa `orderId` numérico y tópicos distintos (configurables por entorno), y cualquier motivo de rechazo distinto de `INSUFFICIENT_BALANCE` queda como saldo insuficiente. La reconciliación está apagada porque falta la consulta de estado y, bajo `kafka`, no hay `BankHoldQueryClient`. Ver [[Hold de monedas]].

## Opciones
1. **Alinear Mercado al contrato de Accounting** donde su código ya lo define (jerarquía de verdad, rango 4 para su lado): tópicos, `orderId` UUID y manejo de todos los motivos de rechazo.
2. **Pedir a Accounting cambios**: consulta `GET /holds/{holdId}` (D5, ya en implementación), expiración con `HOLD_EXPIRED` (D4), aceptar cualquier `catalogItemId` (D10).

## Recomendación
Opciones 1 y 2 en paralelo: Mercado se alinea a lo que accounting ya define y pide por separado los cambios D4, D5 y D10. Cuando se integre la consulta, implementar el `BankHoldQueryClient` real y encender `bank-hold.reconciliation.enabled`. Es el trabajo P0 de [[Roadmap de trabajo]].

## Quién decide / con qué equipo hay que hablar
Equipo de Accounting (Tema 08, grupo G12 en Taiga).

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: se adopta el contrato de Accounting tal como lo define su código más el mensaje del 2026-10-01 (`accounting.events`, `orderId` UUID canónico persistido como `orderRef`, `INSUFFICIENT_BALANCE`, motivos de release `AUCTION_LOST`, `AUCTION_CANCELLED` y `PURCHASE_NOT_COMPLETED`, TTL fijado por Accounting para `DIRECT_PURCHASE`, `ITEM_CONFIRMED` en `market.events` y `ITEM_CREDITED` de vuelta, `HOLD_INCREASE_REQUESTED` con el total nuevo, `GET /api/accounting/holds/{holdId}` este sprint y mapeo de todos los motivos de rechazo). **Excluye** el orden de la compra, que sigue abierto en [[Q-008 - Orden de la saga de compra]]. Ver [[DEC-009 - Contrato de holds e ítems según Accounting]]. Pregunta archivada.
