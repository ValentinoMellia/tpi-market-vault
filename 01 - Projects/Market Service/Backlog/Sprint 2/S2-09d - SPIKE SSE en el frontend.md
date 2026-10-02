---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
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

- [ ] ¿Cómo se consume text/event-stream en el frontend con Signals (EventSource o fetch con ReadableStream) y cómo se envían las cabeceras X-User-Id y X-User-Roles si el gateway no las inyecta en una conexión EventSource?
- [ ] ¿Qué entrega hoy el backend: un único evento de estado y cierre (según [[SSE]])? ¿Alcanza para mostrar el progreso o hace falta que emita cada cambio hasta un estado terminal?
- [ ] ¿Cómo se maneja la reconexión, el cierre sin estado terminal y el respaldo por GET /api/market/orders/{orderId}?
- [ ] ¿Cómo se limpia la conexión al salir de la pantalla y cómo se prueba el patrón?

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

- [ ] Las cuatro preguntas tienen respuesta escrita.
- [ ] La PoC muestra un cambio de estado de una orden de prueba sin recargar la página.
- [ ] La nota del patrón está publicada y enlazada desde [[S2-08 - Frontend de Mercado]].
- [ ] Si el backend debe cambiar, hay una historia o tarea propuesta.

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
