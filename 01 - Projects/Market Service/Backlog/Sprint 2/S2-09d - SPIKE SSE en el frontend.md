---
tipo: historia
estado: borrador
verificado_contra: codigo@03f502ee
actualizado: 2026-10-10
tags: [mercado, backlog, sprint-2, spike]
sprint: 2
taiga: "#5259"
puntos: 2
prioridad: Should
horas: 4
---
# S2-09d - SPIKE SSE en el frontend

> Definir el patrón para consumir [[SSE]] en el frontend con Signals y el kit de UI, y comprobar qué entrega hoy `GET /api/market/orders/stream/{orderId}`. Alimenta la tarea de estado en vivo de [[S2-08 - Frontend de Mercado]]. 1 tarea, 4 h, 2 puntos, Should.

## [G11] — SPIKE: SSE en el frontend

---

## Objetivo

Elegir y probar un patrón de consumo de SSE para el estado de la compra, para que la tarea de estado en vivo de [[S2-08 - Frontend de Mercado]] se implemente sin rehacer la base.

---

## Preguntas a responder

- [x] ¿Cómo se consume text/event-stream en el frontend con Signals (EventSource o fetch con ReadableStream) y cómo se envían las cabeceras X-User-Id y X-User-Roles si el gateway no las inyecta en una conexión EventSource?
- [x] ¿Qué entrega hoy el backend: un único evento de estado y cierre (según [[SSE]])? ¿Alcanza para mostrar el progreso o hace falta que emita cada cambio hasta un estado terminal?
- [x] ¿Cómo se maneja la reconexión, el cierre sin estado terminal y el respaldo por GET /api/market/orders/{orderId}?
- [x] ¿Cómo se limpia la conexión al salir de la pantalla y cómo se prueba el patrón?

---

## Entregable

- **Qué queda al terminar**: prueba de concepto (PoC) de un servicio con Signals que consume `sseStreamUrl`, y una nota breve con el patrón recomendado y, si hace falta, el pedido de cambio al backend.
- **Dónde**: rama del frontend y nota en [[SSE]] (sección de uso en el frontend).

---

## Timebox

- **Horas máximas**: 4 h en total.
- Al agotarse el timebox se documenta lo probado y lo que queda abierto.

---

## Criterios de cierre

- [x] Las cuatro preguntas tienen respuesta escrita (sección *Resultado del spike*).
- [x] La PoC muestra un cambio de estado de una orden de prueba sin recargar la página (prueba B: "En proceso" a "Compra confirmada" sin recargar; capturas en la tarea de Taiga 5260).
- [x] La nota del patrón está publicada y enlazada desde [[S2-08 - Frontend de Mercado]] (la nota está en [[SSE]], subsección *Verificado (US-5259 T01)*; se publica con este PR).
- [x] Si el backend debe cambiar, hay una historia o tarea propuesta (sección *Propuesta de historia del backend*; es opcional, el seguimiento funciona hoy con el respaldo por GET).

---

## Resultado del spike (2026-10-10)

**Evidencia.** Se verificó contra `2026-PIV-TPI-FE` `develop` `ecb356b9` (kit `@2026-p4-fe/ui` 0.7.1) y `tpi-market` `develop` `03f502ee`. El patrón ya estaba implementado: entró a `develop` con el PR #261 de la US-5236 (merge `eef81a0c`, 2026-10-09; tracker en `01abf7af`), así que el spike lo verifica y documenta, no lo reescribe. Se probó con el back en perfil `dev` y transporte `mock`, y el gateway, Cursos y Usuarios reemplazados por un stub local con valores falsos. Tests: `ng test` sobre `marketplace/data-access` y `marketplace/ui/order-status`, 27 archivos y 267 pruebas aprobadas.

### Respuestas

1. **Consumo y cabeceras.** `EventSource` envuelto en un `Observable`, creado por un token de fábrica (`EVENT_SOURCE_FACTORY`) para poder reemplazarlo en tests; los Signals `event` e `interrupted` viven en un servicio de seguimiento con alcance de componente. No hace falta `fetch` con `ReadableStream`. El front no manda `X-User-Id` ni `X-User-Roles`: viaja la cookie de sesión y el gateway pone las cabeceras (en desarrollo, `proxy.conf.json`). Archivos de `src/app/features/marketplace/data-access/`: `order-status-stream.service.ts` y `order-tracking.service.ts`. Ver [[Gateway e identidad]].
2. **Qué entrega el backend.** Un único evento `order-status` con el estado actual y cierre (`PurchaseOrderController.streamOrder`, `src/main/java/ar/edu/utn/frc/tup/p4/controllers/PurchaseOrderController.java`; sin `retry:`). Confirmado en el navegador: `Content-Type: text/event-stream`, `Connection: close` y un solo evento. Alcanza para que la pantalla llegue a un estado final porque el front consulta `GET /api/market/orders/{orderId}` cada 3 s (hasta 60 veces), y si el primer evento ya es final no hay consultas; no alcanza para un seguimiento en vivo de cada transición. La pantalla muestra todos los estados en curso como "En proceso", así que hoy los intermedios no se verían aunque el back los emitiera.
3. **Reconexión, cierre sin estado final y respaldo.** La reconexión la hace el navegador. Con un corte de red (DevTools, Offline unos 20 s) fallaron el stream y las consultas, el navegador reintentó solo y el seguimiento se recuperó sin intervención. Tras unos 3 minutos sin estado final aparece el aviso "No pudimos confirmar el resultado. Tu compra sigue registrada: no la repitas." con el botón "Consultar estado", que reabre el stream y el respaldo sin crear otra orden ([[Idempotencia]]). El respaldo usa la misma ruta que [[SSE]] abrevia como `/market/orders/{orderId}`: el front le antepone `/api`.
4. **Limpieza y pruebas.** La conexión se cierra al desuscribirse, el tracker se detiene con `DestroyRef` y se reinicia al cambiar de curso; las pruebas reemplazan el `EventSource` por un doble y usan temporizadores falsos.

### Mejoras propuestas para el front (no implementadas)

- **F1.** El modal "Confirmar compra" queda abierto, con el botón girando, todo el seguimiento (más de 3 minutos); conviene cerrarlo al recibir el 202 y mostrar el estado en la página.
- **F2.** El aviso de interrupción tiene un botón chico y convive con "Compra en proceso"; conviene un `GenericCallout` con un botón visible que reemplace al aviso de proceso. El kit 0.7.1 no tiene un componente de falla con reintento.
- **F3.** Los botones "Comprar" de la vitrina parecen habilitados mientras hay una orden en curso, aunque el código bloquea la compra; conviene deshabilitarlos o explicarlo. No se verificó qué pasa al hacer clic.

Otras mejoras menores (corte de red sin indicador, error del stream sin distinguir, `sse_stream_url` sin usar, cobertura del tracker, traducciones mapeadas por texto) quedan en el borrador del spike y no se cargan como tareas.

### Propuesta de historia del backend (opcional)

- **Título:** seguimiento en vivo de la orden de compra: emitir cada cambio de estado por SSE hasta un estado final.
- **Como** estudiante que compró un ítem, **quiero** que el estado de mi compra se actualice apenas cambia en el servidor, **para** saber enseguida si se concretó, sin esperar hasta 3 segundos entre consultas.
- **Criterios:** el stream emite el estado actual y un evento por cada transición hasta un estado final y cierra; si la orden ya es final al conectarse emite uno solo, como hoy; se mantienen los permisos (403 si la orden es ajena, 404 si no existe); hay latido periódico y `retry:`; se actualiza el contrato `order-progress-stream`, que hoy exige no mantener la conexión; el front deja el GET como respaldo acotado.
- **Riesgos:** con varias instancias el emisor vive en la memoria de una sola y el evento puede ocurrir en otra; timeouts y buffering del gateway; límite de conexiones abiertas; la sesión no se revalida con el stream abierto; cambia el contrato y hay que coordinar con el front. Alternativa sin tocar el back: ajustar el polling (por ejemplo, espera creciente).

### No verificado

- El flujo con el gateway real y la cookie real, y que el gateway no bufferee el SSE.
- El 403 del stream ante una orden ajena y el comportamiento del front ante un error del stream (se leyó en el código y el contrato, no se probó).
- Salir de la pantalla con una orden en curso (cubierto por tests unitarios, no probado en el navegador).
- El seguimiento con la saga real por Kafka: con el transporte `mock` termina en milisegundos y el primer evento ya es final.

### Notas del entorno de desarrollo

- La base H2 es en memoria: reiniciar el back borra las órdenes.
- La consola H2 no existe en Spring Boot 4.0.0 aunque `application-dev.properties` la habilita (`/h2-console` responde 404).
- La compra no funciona en `dev` sin gateway: la inscripción se valida contra Cursos por el gateway (`PurchaseValidationServiceImpl`, `GatewayCourseCohortClient`), sin cliente mock.
- `/api/market/dev/mock-bank` solo maneja saldos y no demora el hold. Para dejar una orden en curso sirve el alumno reservado `student-bank-confirm-unavailable` (`MockBankHoldClient`).

---

## Dependencias

- Servicios / equipos involucrados: Mercado (endpoint SSE) y gateway (cabeceras de identidad).
- Necesita antes: tener una orden de prueba accesible, por ejemplo con el transporte `mock` en dev ([[Estado actual del código]]).
- Desbloquea: la tarea "Estado de la compra en vivo por SSE" de [[S2-08 - Frontend de Mercado]].

---

## Tareas

### T01 - Definir el patrón de consumo de SSE con Signals y el kit de UI

**Objetivo:** Decidir cómo consumir SSE en el frontend y qué entrega hoy el backend.

- PoC contra `GET /api/market/orders/stream/{orderId}`
- Reconexión y respaldo por consulta
- Nota con la recomendación para la tarea de estado en vivo
- Hecho cuando: la PoC funciona y la nota con la recomendación está en el vault

Estimación: 4 h
