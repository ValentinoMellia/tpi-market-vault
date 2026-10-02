---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, sse]
---
# SSE

> Server-Sent Events: el servidor empuja eventos al navegador por una conexión HTTP abierta, en un solo sentido.

## El problema que resuelve
Una compra tarda y responde 202 enseguida; el cliente necesita enterarse del resultado sin consultar en bucle.

## Cómo funciona
El cliente abre una conexión `text/event-stream` y recibe eventos hasta que el servidor la cierra.

## Cómo lo usamos en Mercado
`POST .../orders` devuelve `sseStreamUrl`; `GET /api/market/orders/stream/{orderId}` envía un único evento con el estado actual y cierra, por lo que no sigue el progreso en vivo (la historia #140 queda parcial, [[Épica 137 - Compra directa]]). El filtro de identidad se reejecuta en el despacho asíncrono ([[Gateway e identidad]]). Ver [[Orden de compra]].

## Relacionado
[[Saga]].
