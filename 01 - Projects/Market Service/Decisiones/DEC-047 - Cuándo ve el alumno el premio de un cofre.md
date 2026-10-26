---
tipo: decision
estado: vigente
verificado_contra: codigo@5fb82d80
actualizado: 2026-10-26
tags: [mercado, decision, cofres, orden, sse]
---
# DEC-047 - Cuándo ve el alumno el premio de un cofre

> El alumno ve el premio que le tocó en un cofre recién cuando la orden llega a `CONFIRMED`, y no puede cancelar una orden de cofre cuando el ítem ya va en camino (`ITEM_PROVISION_REQUESTED`). Así no puede espiar el premio y cancelar para volver a tirar.

## Contexto
[[DEC-032 - Sorteo y reglas de configuración de los cofres]] hace que Mercado sortee al crear la orden y guarde el resultado. Desde ese momento el premio existe en la base, aunque la saga recién empiece. [[DEC-034 - Acreditación de premios de cofre en Accounting]] le pidió al frontend mostrar la animación con el premio cuando la orden llegue a `CONFIRMED`, pero eso era una indicación para la pantalla: el backend igual mandaba el premio en el detalle y en el SSE de la orden desde el principio.

Con el premio visible antes de terminar, un alumno podía leerlo por la API, cancelar la orden si no le gustaba y comprar de nuevo. Una orden cancelada libera el hold y no cuenta para el límite ([[DEC-045 - Período del límite de compras de un cofre]]), así que volvía a tirar gratis.

El equipo de Mercado (Patricio Fernandez) lo decidió el 2026-10-25, en la exploración de la T04 de la US-12004 (#12019, decisión D8 del change `us-12004-t04-chest-purchase-saga`, PR 321 de `tpi-market`). Se registra al ingerir la US ([[S3-04 - Cofres, el alumno compra un cofre]]).

## Decisión
- **El alumno ve el premio solo con la orden `CONFIRMED`.** Antes, `drawn_prize` no viaja en el detalle (`GET /orders/{orderId}`) ni en el SSE (`GET /orders/stream/{orderId}`). Una apertura que falla (orden cancelada, rechazada o vencida) nunca se lo muestra.
- **La respuesta de la compra no trae el premio.** El 202 de `POST /courses/{courseId}/catalog/chests/{chestId}/orders` devuelve la orden sin `drawn_prize`; el frontend sigue la apertura por el SSE.
- **`ADMIN`, `GESTOR` y `MS` lo ven siempre en el SSE**, en cualquier estado, para soporte y para otros servicios.
- **El alumno no puede cancelar una orden de cofre en `ITEM_PROVISION_REQUESTED`**: responde 409 `order-not-cancellable` (`MARKET_ORDER_NOT_CANCELLABLE`). En ese estado el ítem ya puede estar en su inventario. Las órdenes directas no cambian.

Lo aplica `services/impl/ChestOrderPrizeView.java` (`visiblePrize`), que usan los mappers del detalle y del SSE; la cancelación está en `services/impl/OrderCancellationServiceImpl.java`.

## Alternativas descartadas
- **Mandar el premio desde el principio y que el frontend lo esconda** (lo que sugería DEC-034): cualquiera que mire la red lo ve antes de tiempo.
- **Mostrarlo desde `ITEM_PROVISION_REQUESTED`:** el ítem todavía puede fallar en Accounting y la orden cancelarse, y el alumno habría visto un premio que no recibe.
- **Prohibir toda cancelación de órdenes de cofre:** de más. Antes de pedir el ítem el premio no se ve, así que cancelar no da ventaja.

## Consecuencias
- **Frontend:** la pantalla de apertura (tasks #10426 y #14119) se queda esperando hasta `CONFIRMED` y recién ahí muestra el premio. Si la orden termina en otro estado, no hay premio que mostrar.
- **Avisos:** el aviso «abriste el cofre y te tocó…» no existe todavía; depende de lo que acepte Notificaciones ([[Q-034 - Avisos de Notificaciones para órdenes de cofre]]).
- **Precisa a DEC-034** en el punto del frontend: la regla ya no depende de la pantalla.

## Notas afectadas
[[Cofre]], [[Orden de compra]], [[DEC-034 - Acreditación de premios de cofre en Accounting]], [[S3-04 - Cofres, el alumno compra un cofre]], [[Decisiones - Índice]].
