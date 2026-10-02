---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2, spike]
sprint: 2
taiga: "#5254"
puntos: 2
prioridad: Must
horas: 3
---
# S2-09b - SPIKE Orden de la compra con Accounting

> Reunión con Accounting y acuerdo sobre [[Q-008 - Orden de la saga de compra]]: qué va primero, entregar el ítem o confirmar el débito, y cómo se compensa cada fallo (incluida la revocación de ítems). Se envía la respuesta preparada en el Inbox. 1 tarea, 3 h, 2 puntos, Must: define cómo se activa `ITEM_CONFIRMED` en [[S2-01 - Contrato con Accounting]].

## [G11] — SPIKE: Orden de la compra con Accounting

---

## Objetivo

Cerrar con Accounting el orden de la saga de compra y su compensación, para decidir cuándo se activa `ITEM_CONFIRMED` y qué estados nuevos necesita la [[Orden de compra]].

---

## Preguntas a responder

- [ ] ¿Qué orden adoptan ambos equipos: A (entregar y luego cobrar, código de Mercado), B (cobrar y luego entregar, código de Accounting) o C (acreditar y luego confirmar, recomendación del taller)?
- [ ] ¿Puede Accounting ofrecer la revocación de un ítem (por itemInstanceId o por orderId) y cuándo?
- [ ] ¿Publicará Accounting un evento de error cuando falle ITEM_CREDITED (hoy va a DLT sin evento)?
- [ ] ¿Cómo se resuelve un hold vencido (TTL fijo de 300 s) después de entregar el ítem?
- [ ] ¿Cuál es la señal exacta del tope de vidas ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]) y se puede tratar en la misma reunión?

---

## Entregable

- **Qué queda al terminar**: acta del acuerdo; una `DEC-NNN` que cierre Q-008 (o, si no hay acuerdo, la pregunta actualizada con la propuesta de cada lado); mensaje enviado a Accounting con los pedidos.
- **Dónde**: `01 - Projects/Market Service/Decisiones/` y [[Integración con Accounting]]; respuesta preparada en el Inbox del vault (borrador de respuesta a Accounting).

---

## Timebox

- **Horas máximas**: 3 h en total (reunión, redacción del acta y envío).
- Al agotarse el timebox, el spike se cierra con lo acordado; lo no acordado queda en Q-008.

---

## Criterios de cierre

- [ ] La reunión con Accounting se realizó y hay acta.
- [ ] El orden de la compra quedó decidido o la pregunta Q-008 sigue abierta con los puntos de desacuerdo.
- [ ] La respuesta preparada en el Inbox fue enviada a Accounting.
- [ ] [[S2-01 - Contrato con Accounting]] y [[S2-07 - Pruebas integradas con Accounting]] reflejan el orden acordado.

---

## Dependencias

- Servicios / equipos involucrados: Accounting (Tema 08, grupo G12 en Taiga) y el líder del equipo de Mercado.
- Necesita antes: lectura de [[Q-008 - Orden de la saga de compra]] y [[Integración con Accounting]] por quienes asisten.
- Desbloquea: activar `market.events.item-confirmed.enabled`, [[S2-01 - Contrato con Accounting]] (tareas 5 y 6) y la prueba punta a punta de [[S2-07 - Pruebas integradas con Accounting]].

---

## Tareas

### T01 - Acordar con Accounting el orden de la compra

**Objetivo:** Cerrar Q-008 con Accounting: qué va primero, entregar el ítem o confirmar el débito.

- Reunión sobre Q-008, la compensación de cada fallo y la revocación de ítems
- Acta y decisión registradas en el vault
- Enviar la respuesta preparada en el Inbox
- Hecho cuando: el orden queda acordado y registrado, y se envió la respuesta a Accounting

Estimación: 3 h
