---
tipo: pregunta
estado: en-disputa
verificado_contra: accounting@1360ec3
actualizado: 2026-10-16
tags: [mercado, pregunta-abierta, cofres, accounting, monedas]
---
# Q-028 - Acreditación de premios de cofre en Accounting

> Un cofre puede dar monedas, y Accounting hoy solo acredita monedas por desafíos superados. Hay que acordar con Accounting cómo Mercado le pide acreditar las monedas de un cofre, con idempotencia por orden. También confirmar que los premios de oferta viajan como una compra directa y qué pensaban hacer con `LOOT_CHEST`.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Mercado | Un cofre puede dar monedas. Mercado sortea y pide acreditar el premio ([[DEC-031 - Cofres configurables con ítems, monedas y XP]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]]) | Decisiones de Mercado |
| Accounting | Solo acredita monedas con el movimiento `CHALLENGE_CREDIT`, dentro de la liquidación de un desafío | Código de `tpi-accounting` |

No es una contradicción con el PRD: el PO ya lo habilitó. Es un contrato que no existe.

## Qué hace hoy el código
En `tpi-accounting` (`1360ec3`, 2026-10-13):

- `dtos/coins/CoinMovementType.java` tiene `CHALLENGE_CREDIT`, `DIRECT_PURCHASE_DEBIT`, `AUCTION_WIN_DEBIT` y `COINS_REVERSAL`. No hay un crédito por compra ni por premio.
- `services/impl/coins/CoinsCreditServiceImpl.java` aplica solo `CHALLENGE_CREDIT`. La idempotencia es por cuenta y `challengeId` (`existsChallengeCredit` y la restricción única de `V20261006120000__coins_ledgers_challenge_credit_unique.sql`).
- `LedgerWriteService.appendCreditEntry` documenta su referencia como un id de desafío. Los débitos, en cambio, ya usan el `orderId`.
- No hay evento ni endpoint para que otro servicio pida acreditar monedas.
- `V4__create_inventory_items.sql` nombra `LOOT_CHEST` en un comentario de `item_type`. Ningún código Java lo usa. El frontend también lo lista entre los tipos conocidos.

En Mercado los premios de oferta ya tienen camino: `ITEM_CONFIRMED` por `market.events`, como en la compra directa ([[Integración con Accounting]]).

## Opciones
1. **Movimiento nuevo de crédito por premio, pedido por evento.** Por ejemplo `CHEST_REWARD_CREDIT` (el nombre lo eligen ellos), idempotente por cuenta y `orderId`, y pedido con un evento en `market.events` desde el outbox de Mercado. Es el mismo canal que el resto de la saga. Les exige un tipo de movimiento, un listener y una restricción única nuevos.
2. **Lo mismo, pedido por HTTP.** Respuesta sincrónica, pero Mercado no usa HTTP para escribir en Accounting en ninguna otra parte de la saga.
3. **Reutilizar `CHALLENGE_CREDIT` con el `orderId` como `challengeId`.** No requiere tipo nuevo, pero mezcla en el libro contable los premios de cofre con los de desafíos y rompe el significado del campo. No se recomienda.

## Recomendación
Opción 1, con estas condiciones:

- Mercado pide la acreditación solo después de que se debitó el precio del cofre (`DIRECT_PURCHASE_DEBIT`).
- Accounting responde con un evento de éxito o de falla, como hace con `ITEM_CREDITED` e `ITEM_CREDIT_FAILED`.
- Los premios de oferta van con `ITEM_CONFIRMED`, con el tipo y las cargas copiados de la oferta ([[DEC-032 - Sorteo y reglas de configuración de los cofres]]). Accounting no necesita saber que salieron de un cofre.
- Las vidas van con `LIFE_PURCHASE_CONFIRMED`, como en la compra de vidas. Accounting acredita hasta el tope y reporta con `LIFE_CREDITED` ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]).
- En este modelo el cofre nunca entra al inventario, así que `LOOT_CHEST` no se usaría.

## Quién decide / con qué equipo hay que hablar
Accounting (ex Banco, Tema 08, G12 en Taiga). Patricio les lleva la pregunta (task T02 #8427 de la US-8400). Preguntas concretas:

1. ¿Aceptan un movimiento nuevo de crédito por premio de cofre, idempotente por `orderId`? ¿Con qué nombre?
2. ¿Prefieren que se pida por evento (`market.events`) o por HTTP?
3. ¿Qué eventos de respuesta publican?
4. ¿Tenían algo pensado para `LOOT_CHEST`? ¿Puede quedar sin uso?
5. ¿Confirman que un premio de equipamiento llega con `ITEM_CONFIRMED` y una vida con `LIFE_PURCHASE_CONFIRMED`, sin cambios?

## Resolución
Pendiente.
