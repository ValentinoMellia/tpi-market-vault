---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-09
tags: [concepto, sse]
---
# SSE

> Server-Sent Events: el servidor empuja eventos al navegador por una conexión HTTP abierta, en un solo sentido.

## El problema que resuelve
Una compra tarda y responde 202 enseguida; el cliente necesita enterarse del resultado sin consultar en bucle.

## Cómo funciona
El cliente abre una conexión `text/event-stream` y recibe eventos hasta que el servidor la cierra.

## Cómo lo usamos en Mercado
`POST .../orders` devuelve `sse_stream_url` (el cuerpo REST va en `snake_case`, [[Errores de la API]]); `GET /api/market/orders/stream/{orderId}` envía un único evento con el estado actual y cierra, por lo que no sigue el progreso en vivo (la historia #140 queda parcial, [[Épica 137 - Compra directa]]). El filtro de identidad se reejecuta en el despacho asíncrono ([[Gateway e identidad]]). Ver [[Orden de compra]].

## Uso propuesto en el frontend (US-5236)

En `2026-PIV-TPI-FE`, rama `feature/us-5236-marketplace-frontend`, commit `b22ed6ed3f5812b5e899fab911fea12db2d3789f`, el patrón de [[S2-08 - Frontend de Mercado]] combina `EventSource` con consultas del detalle. No cambia el comportamiento del backend descrito arriba, verificado contra `tpi-market@7528610`, ni confirma que esta rama esté integrada.

- `src/app/features/marketplace/data-access/order-status-stream.service.ts` escucha el evento nombrado `order-status`, convierte claves `snake_case` y normaliza identificadores numéricos seguros a texto. `EventSource` no pasa por los interceptores de `HttpClient` ni agrega cabeceras de identidad; la autenticación real debe verificarse con el gateway.
- `src/app/features/marketplace/data-access/order-tracking.service.ts` consume como máximo un evento SSE (`take(1)`) y consulta `GET /market/orders/{orderId}` como respaldo. El recurso inicia la consulta al recibir el identificador; el temporizador pide recargas cada 3 segundos hasta un límite de 60 iteraciones. Al llegar al límite informa seguimiento interrumpido, no compra fallida.
- Un estado terminal detiene el seguimiento. Salir del componente libera conexión y temporizador; cambiar de curso reinicia el tracker. Reintentar solo reinicia el seguimiento de la misma orden, sin otro `POST` ([[Idempotencia]]).

El patrón no exige que el backend emita todos los cambios para mostrar el resultado, pero tampoco prueba una conexión autenticada o una compra real. El spike [[S2-09d - SPIKE SSE en el frontend]] conserva sus criterios pendientes hasta verificar esas condiciones.

## Relacionado
[[Saga]].
