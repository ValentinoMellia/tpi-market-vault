---
tipo: historia
estado: en-disputa
verificado_contra: codigo@7528610
actualizado: 2026-10-17
tags: [mercado, backlog, sprint-2, spike]
sprint: 2
taiga: "#5256"
puntos: 5
prioridad: Should
horas: 10
---
# S2-09c - SPIKE Diseño técnico de subastas

> Diseñar el modelo, los estados, la fase final ciega y el contrato con Accounting y Cursos para las subastas, de modo que el Sprint 3 empiece implementando. Parte de [[DEC-014 - Reglas de subastas]] y [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]. 2 tareas, 10 h, 5 puntos, Should.

## Estado vigente: retiro definitivo y acuerdo publicado (2026-10-17)

[[DEC-032 - Retiro definitivo y contrato de holds de subastas]] sustituye la discusión anterior: el alumno retira, recupera el disponible sin cobro y no puede volver a pujar. Mercado bloquea antes de otro create; HOLD_ALREADY_EXISTS es defensa adicional. HOLD_RELEASE_REQUESTED usa AUCTION_BID_WITHDRAWN, todavía pendiente de incorporación al enum de Accounting. El hold queda RELEASED definitivamente; las mejoras de una oferta activa reutilizan PENDING. Los límites de fase no aprobados del spike siguen siendo propuesta.

[Respuesta aprobada y publicada](https://github.com/2026-P4-BE/tpi-market/issues/200#issuecomment-6244678432). El usuario aceptó TTL configurable de 16 días y rechazo de confirmaciones vencidas con INVALID_HOLD_STATE. [[Q-028 - Retiro y re-oferta frente al ciclo del hold]] quedó archivada por la decisión funcional, sin afirmar implementación del motivo pendiente.

La baja libera con ACCOUNT_DEACTIVATED, correlation_id nulo y sin doble release. Se confirman payload HOLD_INCREASED, diez rechazos comunes y studentId:courseId para operaciones por postor. La extensión por orden usa key order_id y no cambia endsAt ni recupera expirados. Detalle y fuentes en [[Seguimiento con Accounting - Subastas y holds]]. No cambian dado vigente, saga C ni acuerdos de meta colectiva.

Las secciones anteriores y siguientes que describen retiro con re-oferta o pendientes ya confirmados se conservan como historial superado por esta decisión.

## Actualización con Accounting (2026-10-17)

[[Seguimiento con Accounting - Subastas y holds]] registra las respuestas recibidas y la aclaración de Mercado. El usuario reporta que Hernán confirmó permitir retiro y re-oferta; Accounting los excluyó usando el PRD anterior. Discrepancia y mecanismo de reingreso abiertos en [[Q-028 - Retiro y re-oferta frente al ciclo del hold]]. Aumentar reutiliza el mismo hold PENDING mediante `HOLD_INCREASE_REQUESTED` / `HOLD_INCREASED`; no acredita reabrir RELEASED.

Accounting informa que la baja libera con `ACCOUNT_DEACTIVATED`, sin `AUCTION_BIDDER_UNENROLLED`, y anuncia `HOLD_EXPIRY_EXTEND_REQUESTED` / `HOLDS_EXPIRY_EXTENDED` para PENDING por orden, solo alargando y con tope; payload final pendiente de AsyncAPI. Quedan por responder TTL de 16 días, rechazos, payload de HOLD_INCREASED y clave `studentId:courseId`. Rechazar confirmaciones vencidas con INVALID_HOLD_STATE está en evaluación. Extender holds no modifica el cierre fijo de DEC-014.

Las secciones siguientes conservan sus verificaciones históricas; esta actualización supera pedidos anteriores de motivo por baja y ausencia de comando de extensión. No acredita despliegue ni ratifica la saga C para subastas. La propuesta detallada está en [[Flujos de compra directa y subasta]].

## [G11] — SPIKE: Diseño técnico de subastas

---

## Objetivo

Dejar un diseño técnico de subastas listo para implementar en el Sprint 3: entidades, máquina de estados, eventos e integración con Accounting y Cursos.

---

## Preguntas a responder

- [ ] ¿Qué entidades y campos tiene una subasta (modo abierta o ciega, incremento mínimo, duración máxima de 14 días, X de la fase final ciega, ítem del catálogo subastado)?
- [ ] ¿Cuál es la máquina de estados de la subasta y cómo se deriva la fase (visible o ciega) del tiempo restante?
- [ ] ¿Cómo se mapea cada oferta a los comandos de Accounting: HOLD_CREATE_REQUESTED con orderType: "AUCTION_BID" y ttlSeconds, HOLD_INCREASE_REQUESTED con el total nuevo y un HOLD_RELEASE_REQUESTED por postor con AUCTION_LOST o AUCTION_CANCELLED?
- [ ] ¿Cómo se decide y audita el desempate por dado en el servidor y qué datos se registran?
- [ ] ¿Qué hace Mercado ante COURSE_ARCHIVED y STUDENT_UNENROLLED (tópico courses.events)?
- [ ] ¿Qué regla rige la oferta ciega (pendiente en DEC-014) y qué propuesta se lleva al equipo?

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

## Resultado (borrador, 2026-10-09)

El diseño está en [[Subasta]], sección "Diseño técnico", pendiente de revisión del equipo. Estado de las preguntas:

| Pregunta | Estado |
|---|---|
| Entidades y campos | Respondida (propuesta) |
| Estados y fase derivada del tiempo | Respondida (propuesta), con `DRAFT` y `SCHEDULED` |
| Mapeo a Accounting | Respondida (propuesta); abiertas: TTL máximo para `AUCTION_BID`, si `HOLD_INCREASE_REQUESTED` extiende el vencimiento y el motivo de release para un retiro |
| Desempate | **Abierta**: propuesta provisional de oferta más antigua, con el ranking de `tpi-roadmap` como mejora del siguiente sprint. Contradice a [[DEC-014 - Reglas de subastas]], que pide un dado; mientras no se decida, rige el dado ([[Q-025 - Desempate de las subastas]]) |
| `COURSE_ARCHIVED` y `STUDENT_UNENROLLED` | Respondida (propuesta); abierto: el contenido de los eventos |
| Regla de la oferta ciega | Respondida (propuesta) |

Las preguntas para los otros equipos están en el borrador del Inbox ("Preguntas para Accounting, Cursos y G10 - subastas"). Las historias del Sprint 3 se ajustaron en [[S3-01 - Subastas, lanzar y ver las abiertas]].

## Tareas

### T01 - Diseñar el modelo, los estados y la fase final ciega de las subastas

**Objetivo:** Dejar definido el modelo de subastas para que el Sprint 3 empiece implementando.

- Entidades y máquina de estados
- Derivación de la fase ciega y desempate por dado auditable
- Propuesta para la regla de la oferta ciega
- Hecho cuando: el diseño está documentado en el vault y revisado por el equipo

Estimación: 5 h

### T02 - Definir el contrato de subastas con Accounting y Cursos

**Objetivo:** Especificar las secuencias de mensajes que necesitan las subastas.

- Secuencias de `HOLD_CREATE_REQUESTED` (`AUCTION_BID`) y `HOLD_INCREASE_REQUESTED`
- Releases por postor
- Consumo de `COURSE_ARCHIVED` y `STUDENT_UNENROLLED`
- Hecho cuando: las secuencias están documentadas y validadas con ambos equipos

Estimación: 5 h
