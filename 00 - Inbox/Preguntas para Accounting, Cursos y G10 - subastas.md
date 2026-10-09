---
tipo: guia
estado: borrador
verificado_contra: ninguno
actualizado: 2026-10-09
tags: [mercado, subastas, inbox, accounting, cursos]
---
# Preguntas para Accounting, Cursos y G10 sobre subastas — borrador

> Borrador de los mensajes que salen del spike [[S2-09c - SPIKE Diseño técnico de subastas]]: tres mensajes breves con las dudas que solo pueden contestar otros equipos. Revisar y ajustar antes de enviar. Se basan en el diseño de [[Subasta]], que todavía es un borrador sin confirmar por el equipo de Mercado.

---

## Para Accounting

Hola, estamos diseñando las subastas y necesitamos confirmar cuatro cosas sobre los holds de `AUCTION_BID`:

**1) TTL largo.** Una subasta puede durar hasta 14 días y cada oferta retiene sus monedas hasta el cierre. Pensamos mandar `ttlSeconds` igual al tiempo que falta hasta el cierre más 24 horas de margen para liquidar. ¿Hay un máximo para `ttlSeconds` en `AUCTION_BID`? ¿Aceptan hasta 15 días? La compra directa no cambia: seguimos con `DIRECT_PURCHASE` y sus 300 s fijos.

**2) Subir una oferta.** Cuando un estudiante mejora su oferta mandamos `HOLD_INCREASE_REQUESTED` con el total nuevo. ¿Eso también extiende el vencimiento del hold, o conserva el original?

**3) Retiro voluntario.** Un estudiante puede retirar su oferta mientras la subasta está en fase visible, y liberamos su hold. Los motivos de `HOLD_RELEASE_REQUESTED` que conocemos son `AUCTION_LOST`, `AUCTION_CANCELLED` y `PURCHASE_NOT_COMPLETED`. ¿Usamos `AUCTION_LOST` o prefieren un motivo nuevo para el retiro?

**4) Reintentos de `ITEM_CONFIRMED`.** Si la liquidación del ganador falla, la reintentamos. ¿Un `ITEM_CONFIRMED` repetido con el mismo `orderId` acredita una sola vez o puede duplicar el ítem? Para esto también seguimos esperando `ITEM_CREDIT_FAILED` e `ITEM_REVOKE_REQUESTED` de la [[Propuesta C de la saga de compra]].

Además, confirmamos lo que ya les adelantamos: al cancelar una subasta mandamos un `HOLD_RELEASE_REQUESTED` por postor, no uno por `orderId`.

Saludos,
Equipo de Mercado

---

## Para Cursos

Hola, para las subastas vamos a consumir `COURSE_ARCHIVED` y `STUDENT_UNENROLLED` del tópico `courses.events`. Necesitamos saber:

**1) Contenido.** ¿Qué campos trae cada evento? Como mínimo necesitamos el identificador del curso o cohorte y el del estudiante.

**2) Cohorte o curso.** Las subastas se dan en un curso y cohorte, y la pertenencia la verificamos con `GET /course-cohorts/{id}/membership`. ¿El `courseId` de sus eventos es el `courseCohortId`?

**3) Entrega.** ¿Los eventos se entregan al menos una vez y pueden llegar repetidos o fuera de orden?

Saludos,
Equipo de Mercado

---

## Para G10 (`tpi-roadmap`), para el siguiente sprint

Hola, queremos usar la posición del ranking de la cohorte para desempatar subastas. Hoy `GET /courses/{courseId}/ranking` solo admite los roles `STUDENT`, `ADMIN` y `PROFESSOR`, y el cierre de una subasta es automático, sin un usuario presente. Vimos que `.../nodes/*/eligibility` ya está pensado solo para servicios.

**1)** ¿Pueden agregar una consulta para servicios que devuelva la posición de un grupo de estudiantes de una cohorte (por ejemplo, los que empatan una subasta)?

**2)** ¿Qué scope tendría que declarar Mercado?

**3)** Las filas iguales comparten puesto. Si Mercado recibe dos estudiantes con el mismo puesto, desempatamos nosotros por la oferta más antigua. ¿Les parece bien?

Por ahora desempatamos solo por la oferta más antigua, así que no es bloqueante.

Saludos,
Equipo de Mercado
