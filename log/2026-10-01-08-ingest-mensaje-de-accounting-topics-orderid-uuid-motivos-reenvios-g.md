## [2026-10-01] ingest | Mensaje de accounting (topics, orderId UUID, motivos, reenvíos, GET hold)
- Se ingirió la nota de inbox `2026-10-01` (mensaje del equipo de accounting) y se eliminó del inbox tras reescribirla.
- Nueva sección "Mensaje de accounting del 2026-10-01 y estado" en [[Integración con Accounting]], con el estado de los siete puntos verificado contra `tpi-market@7528610`.
- Corrección: Mercado ya traduce `INSUFFICIENT_FUNDS` a `INSUFFICIENT_BALANCE` en el cable y libera siempre con `PURCHASE_NOT_COMPLETED`; se quitaron esas filas de la tabla de diferencias y de [[Q-007 - Contrato con Accounting]].
- Brechas nuevas en [[Estado actual del código]] (22 y 23: motivos de rechazo desconocidos y tópico compartido) y filas P0/P1 en [[Roadmap de trabajo]] (`orderId` UUID, tópicos, `BankHoldQueryClient` real con la consulta de accounting).
- Se actualizaron [[Q-008 - Orden de la saga de compra]] (el mensaje no toca la saga), [[Q-012 - Alcance de subastas]] (opción de release por `orderId`), [[Hold de monedas]], [[Subasta]] y [[Orden de compra]].
