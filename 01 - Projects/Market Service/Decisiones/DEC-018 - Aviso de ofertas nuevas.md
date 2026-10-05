---
tipo: decision
estado: vigente
verificado_contra: codigo@9b4c05f9
actualizado: 2026-10-05
tags: [mercado, decision, notificaciones, catalogo, eventos]
---
# DEC-018 - Aviso de ofertas nuevas

> Cuando un profesor publica una oferta o reactiva una pausada, Mercado publica `CATALOG_OFFER_PUBLISHED` o `CATALOG_OFFER_REACTIVATED` en `market.events`, dirigido al curso (`courseId`) y no a una lista de alumnos. Las activaciones que hace un ADMIN, GESTOR o servicio no avisan, y una oferta vencida no se reactiva por ningún camino.

## Contexto
La historia #1052 pide avisar a los alumnos de un curso cuando el profesor publica o reactiva una oferta. Había cuatro decisiones abiertas en [[Q-022 - Aviso de ofertas nuevas]] (archivada): cuántos eventos usar, quién arma la lista de destinatarios, si la activación del admin avisa y qué pasa con las ofertas vencidas. Notificaciones ya consume `market.events`, pero espera `TRADE_ITEM_PUBLISHED` con la lista `student_user_ids` armada por el productor ([[Integración con Notificaciones]]).

## Decisión
Tomada por Lucio Wiesek, responsable de #1051 y #1052, el 2026-10-05, antes de enviar el [[Contrato de avisos de compra]] a Notificaciones. Queda sujeta a la revisión del PR del vault que la registra.

- **Dos eventos.** `CATALOG_OFFER_PUBLISHED` cuando se crea una oferta (queda activa al crearse) y `CATALOG_OFFER_REACTIVATED` cuando una oferta pasa de `active = false` a `active = true`. Los dos llevan el mismo payload, así Notificaciones redacta un texto distinto para cada hecho sin leer campos.
- **Destinatario: el curso.** El evento lleva `courseId` y no lleva lista de alumnos. Notificaciones resuelve los alumnos del curso con Cursos, que es el dueño de la matrícula. La key del mensaje es `courseId`.
- **Sin stock.** El aviso dice que hay una oferta, no cuántas unidades quedan: la US-1052 no lo pide y un cambio de stock no genera aviso. La tarea #1058 original pedía "disponibilidad de stock"; se descartó el 2026-10-05 al reescribir las tareas.
- **Solo avisa la acción de un profesor.** El criterio es quién actúa, no la ruta: se avisa si el usuario que publica o reactiva tiene el rol `PROFESSOR`, por cualquiera de las tres rutas del curso. Un ADMIN, GESTOR o servicio con `MS` no genera aviso por ninguna ruta, incluida la ruta global `PATCH /offers/{id}/status`, porque puede estar probando ofertas y no debe notificar a todo el curso. Si el usuario tiene `PROFESSOR` además de otro rol, avisa.
- **Una oferta vencida no se reactiva.** Una oferta cuya `publicationExpiresAt` ya pasó no vuelve a activarse por ningún camino; el profesor publica una nueva, como ya exige `updateOffer` ("Una oferta vencida no puede reactivarse; publique una nueva oferta"). El aviso de reactivación cubre solo ofertas pausadas. Mientras las rutas de estado no tengan esa validación, Mercado no publica el aviso para una oferta vencida.

## Alternativas descartadas
- **Un evento con un campo `trigger` (`NEW` o `REACTIVATED`)**: un tipo menos, pero obliga a Notificaciones a leer el campo para cambiar el texto y se aparta de un `eventType` por hecho.
- **Mercado manda `studentIds`**: encaja con la regla BR-01 de Notificaciones, pero Mercado no puede listar alumnos (`CourseEnrollmentClient` solo responde si un alumno está inscripto y es un mock), el mensaje crece con el curso y la lista queda congelada al publicar.
- **Avisar también en la activación del admin**: para el alumno sería una oferta nueva, pero un admin que prueba ofertas notificaría a todo el curso.
- **Incluir el stock disponible** (lo pedía la #1058 original): cambia con cada venta y la historia no lo pide.
- **Criterio por ruta** (avisan las tres rutas del curso sin mirar el rol): un admin que prueba desde la ruta del curso igual notificaría.
- **Permitir reactivar ofertas vencidas con aviso**: obliga a quitar la validación de `updateOffer` y a definir qué pasa con `publicationExpiresAt` al reactivar.

## Consecuencias
- Notificaciones tiene que aceptar los dos eventos nuevos en su listener de `market.events` y resolver los destinatarios por `courseId` en lugar de exigir `student_user_ids`. Se negocia con el contrato ([[Contrato de avisos de compra]]).
- La tarea #1059 (T02 de #1052) publica el evento desde el outbox en la misma transacción que crea o reactiva la oferta, solo si quien actúa tiene `PROFESSOR` y la oferta no está vencida. Cambiar precio, stock, nombre o descripción, o pausar, no avisa.
- La tarea #1060 (T03) acota el alcance con `courseId` y evita repetidos: el evento sale solo en la transición a activa y un reenvío del relay conserva el `eventId`, que Notificaciones descarta.
- Queda fuera de #1052 agregar la validación de ofertas vencidas a `updateOfferStatus` y `updateOfferStatusForCourse` (`services/impl/CourseCatalogManageServiceImpl.java`). Hasta entonces esas rutas pueden dejar activa una oferta vencida sin aviso.

## Notas afectadas
[[Q-022 - Aviso de ofertas nuevas]], [[Contrato de avisos de compra]], [[Integración con Notificaciones]], [[Decisiones - Índice]].
