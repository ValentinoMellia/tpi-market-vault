---
tipo: concepto
estado: vigente
verificado_contra: codigo@03f502ee
actualizado: 2026-10-10
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

En `2026-PIV-TPI-FE`, rama `feature/us-5236-marketplace-frontend`, commit `b22ed6ed3f5812b5e899fab911fea12db2d3789f`, el patrón de [[S2-08 - Frontend de Mercado]] combina `EventSource` con consultas del detalle. No cambia el comportamiento del backend descrito arriba, verificado contra `tpi-market@7528610`, ni confirma que esta rama esté integrada (actualización 2026-10-10: la rama se integró en `develop` con el PR #261, merge `eef81a0c`, 2026-10-09).

- `src/app/features/marketplace/data-access/order-status-stream.service.ts` escucha el evento nombrado `order-status`, convierte claves `snake_case` y normaliza identificadores numéricos seguros a texto. `EventSource` no pasa por los interceptores de `HttpClient` ni agrega cabeceras de identidad; la autenticación real debe verificarse con el gateway.
- `src/app/features/marketplace/data-access/order-tracking.service.ts` consume como máximo un evento SSE (`take(1)`) y consulta `GET /market/orders/{orderId}` como respaldo. El recurso inicia la consulta al recibir el identificador; el temporizador pide recargas cada 3 segundos hasta un límite de 60 iteraciones. Al llegar al límite informa seguimiento interrumpido, no compra fallida.
- Un estado terminal detiene el seguimiento. Salir del componente libera conexión y temporizador; cambiar de curso reinicia el tracker. Reintentar solo reinicia el seguimiento de la misma orden, sin otro `POST` ([[Idempotencia]]).

El patrón no exige que el backend emita todos los cambios para mostrar el resultado, pero tampoco prueba una conexión autenticada o una compra real. El spike [[S2-09d - SPIKE SSE en el frontend]] conserva sus criterios pendientes hasta verificar esas condiciones.

### Verificado (US-5259 T01)

Probado el 2026-10-10 contra `2026-PIV-TPI-FE` `develop` `ecb356b9` (kit `@2026-p4-fe/ui` 0.7.1) y `tpi-market` `develop` `03f502ee`, con el back en perfil `dev` y transporte `mock` y el gateway reemplazado por un stub local con valores falsos. Detalle y respuestas en [[S2-09d - SPIKE SSE en el frontend]].

- **Backend:** `PurchaseOrderController.streamOrder` (`src/main/java/ar/edu/utn/frc/tup/p4/controllers/PurchaseOrderController.java`) envía un único evento `order-status` y completa, sin `retry:`; en el navegador la respuesta fue `Content-Type: text/event-stream` y `Connection: close`. El respaldo `GET /api/market/orders/{orderId}` es el mismo que la nota abrevia como `/market/orders/{orderId}` (el front antepone `/api`).
- **Cambio de estado sin recargar:** con un alumno normal la pantalla pasó de "En proceso" a "Compra confirmada" sin recargar, el primer evento ya era final y no hubo consultas de respaldo.
- **Orden que no termina:** con el alumno reservado `student-bank-confirm-unavailable` la orden quedó en curso; hubo una consulta cada 3 s y a los 3 minutos apareció "No pudimos confirmar el resultado" con el botón "Consultar estado", que reinicia el seguimiento sin otro `POST`.
- **Corte de red** (DevTools, Offline unos 20 s): fallaron stream y consultas, el navegador reconectó solo y el seguimiento se recuperó sin intervención.
- **Pruebas:** `ng test` sobre `marketplace/data-access` y `marketplace/ui/order-status`: 27 archivos y 267 pruebas aprobadas.
- **No verificado:** el gateway real con la cookie real y sin buffering del SSE; el 403 del stream ante una orden ajena; la saga real por Kafka.

## Relacionado
[[Saga]].
