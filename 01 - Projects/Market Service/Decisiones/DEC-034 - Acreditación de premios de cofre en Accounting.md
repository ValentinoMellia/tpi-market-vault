---
tipo: decision
estado: vigente
verificado_contra: equipo-accounting@2026-10-16, accounting@1360ec3
actualizado: 2026-10-26
tags: [mercado, decision, cofres, accounting, monedas, kafka]
---
# DEC-034 - Acreditación de premios de cofre en Accounting

> Cuando un cofre da monedas, Mercado pide a Accounting un crédito nuevo (`CHEST_REWARD_CREDIT`, nombre provisorio) con un evento en `market.events`, después del cobro e idempotente por `order_id`. Accounting publica su `BALANCE_CREDITED` de siempre y Mercado no lo espera. El equipamiento y las vidas sorteados viajan como en una compra directa, y `LOOT_CHEST` queda sin uso.

## Contexto
[[DEC-031 - Cofres configurables con ítems, monedas y XP]] permite premios de monedas, y Accounting (ex Banco) solo acreditaba monedas por desafíos (`CHALLENGE_CREDIT`). Pregunta de origen: [[Q-028 - Acreditación de premios de cofre en Accounting]]. Accounting respondió el 2026-10-16 y aceptó la propuesta. Patricio Fernandez definió el mismo día lo que quedaba del lado de Mercado.

## Decisión
- **Movimiento nuevo de crédito por premio de cofre.** Nombre provisorio `CHEST_REWARD_CREDIT`; el definitivo lo confirma Accounting al implementarlo. Idempotente por cuenta y `order_id`.
- **Canal:** un evento en `market.events` desde el outbox de Mercado.
- **Momento:** Mercado lo pide solo después de que se debitó el precio del cofre (`DIRECT_PURCHASE_DEBIT`).
- **Respuesta:** Accounting publica el mismo evento que en cualquier acreditación, `BALANCE_CREDITED` en `accounting.events` (`CoinLedgerEventType`). No tiene evento de falla.
- **Mercado no espera la respuesta (fire-and-forget).** Sigue ignorando los `BALANCE_*`, como hoy. La orden se da por cumplida al debitar, igual que con el XP ([[DEC-033 - Acreditación de XP de cofre en Roadmap]]). No hay saga porque no hay nada que revertir: las monedas se piden después del cobro.
- **Equipamiento sorteado:** viaja con `ITEM_CONFIRMED`, como en la compra directa ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]), con la configuración copiada del premio ([[DEC-032 - Sorteo y reglas de configuración de los cofres]]).
- **Vida sorteada:** viaja con `LIFE_PURCHASE_CONFIRMED`, como en la compra de vidas ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]). Accounting la recorta si el alumno está en el tope.
- **`LOOT_CHEST`:** solo aparece como ejemplo en un comentario de la migración de inventario de Accounting y ningún código lo usa. El cofre nunca entra al inventario, así que no hace falta nada.

## Alternativas descartadas
- **Endpoint HTTP:** Accounting prefiere el evento, y la saga de Mercado ya usa el outbox.
- **Reutilizar `CHALLENGE_CREDIT` con el `order_id` como desafío:** mezcla en el libro contable los premios con los desafíos y rompe el significado del campo.
- **Consumir `BALANCE_CREDITED` para marcar el premio como entregado:** sin un evento de falla, Mercado igual no detectaría los errores. Además, sumaría a Mercado un listener nuevo para un dato que el frontend no necesita.
- **Entregar antes de cobrar, como el equipamiento:** a las monedas acreditadas no hay forma de revocarlas desde la saga.

## Consecuencias
- **Accounting:** un `CoinMovementType` nuevo que `CoinLedgerEventType.resolveFrom` mapea a `BALANCE_CREDITED`, una restricción única por cuenta y `order_id`, y un listener de `market.events`. Lo hace Accounting cuando la task T03 #8428 decida avanzar.
- **Mercado:** un evento nuevo en `market.events` con el `order_id`, la cohorte, el alumno y la cantidad de monedas. El nombre y el payload se cierran al implementar, siguiendo `contratos-kafka` (`snake_case`). Nada cambia en el código hasta la T03.
- **Operación:** si el pedido de crédito falla, el alumno pagó y no recibió las monedas hasta que alguien lo reenvíe. Hay que revisar `market.events.DLT`.
- **Frontend (para la T03):** la apertura del cofre no espera a Accounting ni a Roadmap. El resultado está en la orden desde que se crea. El final para el frontend es la orden en `CONFIRMED`, que ya se sigue por SSE (`GET /orders/stream/{orderId}`) o por `GET /orders/{orderId}`. Recién ahí se muestra la animación con el premio. Desde la US-12004 el backend lo garantiza: el alumno no recibe el premio antes de `CONFIRMED` ([[DEC-047 - Cuándo ve el alumno el premio de un cofre]]). Para monedas y XP conviene aclarar que se acreditan en unos segundos, porque el saldo y el XP se actualizan cuando se vuelven a leer. En el equipamiento, `CONFIRMED` llega después de `ITEM_CREDITED`, así que el ítem ya está entregado.
- **Cierre de la acreditación:** con esta decisión y DEC-033, las cuatro clases de premio tienen camino acordado.

| Premio | Orden | Mensaje | Respuesta que usa Mercado |
|---|---|---|---|
| Equipamiento | Entrega → cobro | `ITEM_CONFIRMED` | `ITEM_CREDITED` / `ITEM_CREDIT_FAILED` |
| Vida | Cobro → entrega | `LIFE_PURCHASE_CONFIRMED` | `LIFE_CREDITED` / `LIFE_PURCHASE_REJECTED` |
| Monedas | Cobro → entrega | `CHEST_REWARD_CREDIT` (provisorio) | Ninguna |
| XP | Cobro → entrega | Evento de XP a Roadmap | Ninguna |

## Notas afectadas
[[Q-028 - Acreditación de premios de cofre en Accounting]], [[Integración con Accounting]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[Cofres y nuevos ítems]], [[Decisiones - Índice]].
