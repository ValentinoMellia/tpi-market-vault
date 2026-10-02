---
tipo: guia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, accounting, inbox]
---
# Respuesta a accounting — borrador

> Borrador de respuesta al mensaje de accounting del 2026-10-01. Revisar y ajustar antes de enviar. Cada respuesta fue verificada contra el código de `tpi-market` (develop @ 7528610).

---

Hola, gracias por el detalle. Respondemos punto por punto:

**1) Tópicos.** Sí. Los tópicos se configuran por variable de entorno, así que apuntamos `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_EVENTS` a `accounting.events` sin cambiar código. Una consulta: como comandos y respuestas comparten el tópico, nuestro consumidor también va a recibir nuestros propios comandos. Vamos a verificar que los ignoremos sin mandarlos al DLT. ¿Ustedes filtran por `eventType` o por `producer` para no procesar sus propias respuestas?

**2) orderId.** Entendido, es bloqueante. Hoy mandamos el id numérico de la orden. Vamos a generar un UUID canónico por orden, persistido junto a la orden, y usarlo como `orderId` en todos los comandos. Les avisamos cuando esté listo.

**3) HOLD_INCREASE_REQUESTED.** Todavía no: las subastas están planificadas para una fase posterior y aún no las implementamos. Cuando lo hagamos, vamos a mandar el total nuevo (`newTotalAmount`), no la diferencia.

**4) Cancelar una subasta.** El formato propuesto (`HOLD_RELEASE_REQUESTED` con `orderId`, sin `holdId`, `releaseReason = AUCTION_CANCELLED`) nos simplifica el cierre. Lo estamos evaluando contra la alternativa de un release por postor y les confirmamos cuando definamos el diseño de subastas.

**5) Motivos de rechazo.** Hoy reconocemos `INSUFFICIENT_BALANCE`. Los demás (`ACCOUNT_INACTIVE`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`) los recibimos sin romper nada, pero al alumno le terminamos mostrando "saldo insuficiente". Vamos a mapearlos para dar un mensaje correcto. `HOLD_INCREASED` lo vamos a manejar junto con las subastas.

**6) Reenvíos.** Sí, deduplicamos en dos capas: por `eventId` (tabla de eventos procesados) y por estado de la orden (si la orden ya avanzó, la respuesta repetida se ignora). Un reenvío con la misma `correlationId` no produce efectos dobles.

**7) GET /api/accounting/holds/{holdId}.** Genial, lo estamos esperando. Ya tenemos el flujo de reconciliación preparado. Cuando lo mergeen implementamos el cliente real y prendemos `bank-hold.reconciliation`.

**Un tema más que nos queda pendiente: el orden de la compra.** Hoy nosotros entregamos el ítem antes de confirmar el débito. Según su modelo, primero se confirma el hold y después se publica `ITEM_CONFIRMED` en `market.events`, y ustedes responden con `ITEM_CREDITED`. Nos preocupa que, si el acreditado del ítem falla, el error termine en el DLT sin evento, y el alumno quede cobrado sin ítem. Proponemos este orden:

1. Primero `ITEM_CONFIRMED`.
2. Después `HOLD_CONFIRM_REQUESTED`.
3. Si el ítem falla, ustedes publican un evento de error y nosotros liberamos el hold.

¿Lo podemos charlar?

Saludos,
Equipo de Mercado
