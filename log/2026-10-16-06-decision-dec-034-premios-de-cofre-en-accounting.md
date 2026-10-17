## [2026-10-16] decision | DEC-034, acreditación de premios de cofre en Accounting
- Registrada [[DEC-034 - Acreditación de premios de cofre en Accounting]] a partir de la respuesta de Accounting del 2026-10-16: movimiento nuevo de crédito por premio (`CHEST_REWARD_CREDIT`, provisorio), idempotente por `order_id`, por evento en `market.events`; responde con `BALANCE_CREDITED`; `LOOT_CHEST` queda sin uso; el equipamiento y las vidas viajan como hoy.
- Definido por Mercado (Patricio Fernandez): fire-and-forget, como el XP de [[DEC-033 - Acreditación de XP de cofre en Roadmap]]. El frontend da por terminada la apertura con la orden en `CONFIRMED` (SSE), sin esperar a Accounting ni a Roadmap.
- Archivada [[Q-028 - Acreditación de premios de cofre en Accounting]]. Actualizadas [[Integración con Accounting]], [[Cofres y nuevos ítems]] y [[Decisiones - Índice]].
- Con DEC-033 y DEC-034, las cuatro clases de premio tienen camino acordado.
