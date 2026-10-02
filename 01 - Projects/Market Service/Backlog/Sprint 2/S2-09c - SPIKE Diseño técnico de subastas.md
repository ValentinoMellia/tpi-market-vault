---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2, spike]
sprint: 2
taiga: "#5256"
puntos: 5
prioridad: Should
horas: 10
---
# S2-09c - SPIKE Diseño técnico de subastas

> Diseñar el modelo, los estados, la fase final ciega y el contrato con Accounting y Cursos para las subastas, de modo que el Sprint 3 empiece implementando. Parte de [[DEC-014 - Reglas de subastas]] y [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]. 2 tareas, 10 h, 5 puntos, Should.

## [G11] — SPIKE: Diseño técnico de subastas

---

## Objetivo

Dejar un diseño técnico de subastas listo para implementar en el Sprint 3: entidades, máquina de estados, eventos e integración con Accounting y Cursos.

---

## Preguntas a responder

- [ ] ¿Qué entidades y campos tiene una subasta (modo abierta o ciega, incremento mínimo, duración máxima de 14 días, X de la fase final ciega, ítem del catálogo subastado)?
- [ ] ¿Cuál es la máquina de estados de la subasta y cómo se deriva la fase (abierta o sellada) del tiempo restante?
- [ ] ¿Cómo se mapea cada oferta a los comandos de Accounting: HOLD_CREATE_REQUESTED con orderType: "AUCTION_BID" y ttlSeconds, HOLD_INCREASE_REQUESTED con el total nuevo y un HOLD_RELEASE_REQUESTED por postor con AUCTION_LOST o AUCTION_CANCELLED?
- [ ] ¿Cómo se decide y audita el desempate por dado en el servidor y qué datos se registran?
- [ ] ¿Qué hace Mercado ante COURSE_ARCHIVED y STUDENT_UNENROLLED (tópico courses.events)?
- [ ] ¿Qué regla rige la oferta sellada (pendiente en DEC-014) y qué propuesta se lleva al equipo?

---

## Entregable

- **Qué queda al terminar**: diseño técnico en la nota [[Subasta]] (modelo, estados, secuencias con Mermaid), lista de eventos y contrato con Accounting y Cursos, y un borrador de historias del Sprint 3 ajustado a [[Carga en Taiga - Sprints 2 y 3]].
- **Dónde**: [[Subasta]], [[Épica 577 - Subastas]] y las notas de integración.

---

## Timebox

- **Horas máximas**: 10 h en total (dos tareas de 5 h).
- Al agotarse el timebox se publica el diseño con lo resuelto y las preguntas abiertas marcadas.

---

## Criterios de cierre

- [ ] Cada pregunta tiene respuesta escrita o está marcada como abierta con su motivo.
- [ ] El diseño está publicado en la nota [[Subasta]] y revisado por el equipo.
- [ ] Hay un diagrama de estados y una secuencia de ofertas con Accounting.
- [ ] Las historias del Sprint 3 están ajustadas y listas para la planning.

---

## Dependencias

- Servicios / equipos involucrados: Accounting (holds de `AUCTION_BID`, un release por postor, no por `orderId`) y Cursos (`COURSE_ARCHIVED`, `STUDENT_UNENROLLED`).
- Necesita antes: [[S2-09b - SPIKE Orden de la compra con Accounting]] (si cambia el contrato) y comunicar a Accounting la decisión de un release por postor ([[Integración con Accounting]]).
- Desbloquea: las historias de subastas del Sprint 3 ([[Roadmap de trabajo]]).

---

## Tareas

### T01 - Diseñar el modelo, los estados y la fase final ciega de las subastas

**Objetivo:** Dejar definido el modelo de subastas para que el Sprint 3 empiece implementando.

- Entidades y máquina de estados
- Derivación de la fase ciega y desempate por dado auditable
- Propuesta para la regla de la oferta sellada
- Hecho cuando: el diseño está documentado en el vault y revisado por el equipo

Estimación: 5 h

### T02 - Definir el contrato de subastas con Accounting y Cursos

**Objetivo:** Especificar las secuencias de mensajes que necesitan las subastas.

- Secuencias de `HOLD_CREATE_REQUESTED` (`AUCTION_BID`) y `HOLD_INCREASE_REQUESTED`
- Releases por postor
- Consumo de `COURSE_ARCHIVED` y `STUDENT_UNENROLLED`
- Hecho cuando: las secuencias están documentadas y validadas con ambos equipos

Estimación: 5 h
