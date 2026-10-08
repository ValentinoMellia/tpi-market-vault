## [2026-10-07] query | Rollback completo por plazo en la propuesta C
- [[Propuesta C de la saga de compra]]: la compensación de los casos 4 y 5 pasa a ser un rollback completo por plazo (revocar el ítem, liberar las monedas y liberar el stock), que no necesita distinguir si el ítem se acreditó.
- Se quita el pedido de consulta del ítem por `orderId` (queda como alternativa descartada) y se agregan las condiciones de la revocación: idempotente y con bloqueo de acreditaciones tardías.
- Se agrega una sección sobre el estado actual de la saga en Mercado. Q-008 sigue abierta.
