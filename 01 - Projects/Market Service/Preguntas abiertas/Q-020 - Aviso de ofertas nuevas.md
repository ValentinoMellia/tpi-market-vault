---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@276af529
actualizado: 2026-10-04
tags: [mercado, pregunta-abierta, notificaciones, catalogo]
---
# Q-020 - Aviso de ofertas nuevas

> La historia #1052 pide avisar a los alumnos de un curso cuando el profesor publica o reactiva una oferta. La base técnica es la misma del [[Contrato de avisos de compra]], pero hay cuatro decisiones abiertas antes de definir el evento: cuántos eventos usar, quién arma la lista de destinatarios, si la activación del admin avisa y si reactivar una oferta vencida cuenta como reactivación.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Historia #1052 | Mercado solo publica el aviso; a quién se le muestra lo decide Notificaciones, y la lista de alumnos es de Cursos | Taiga, #1052 |
| Notificaciones | El productor resuelve la nómina de alumnos activos del curso y la manda en `student_user_ids` (regla BR-01). Si la lista llega vacía, no se avisa a nadie | `tpi-notifications`, rama `develop`, `MarketEventsListener` y su contrato de Kafka §4.5 |
| Notificaciones | El evento de ítem nuevo es `TRADE_ITEM_PUBLISHED`, pensado para un alumno que publica en una tienda de canjes (`publisher_id`, `title`, `cost_points`) | `tpi-notifications`, contrato de Kafka §4.5 |
| Mercado | El evento previsto es `CATALOG_OFFER_PUBLISHED`; publica el profesor y el precio es en monedas | Contexto del Sprint 1, [[Integración con Notificaciones]] |
| Historia #1052 | Solo la acción del profesor que dicta el curso dispara el aviso | Taiga, #1052 |
| Código | Además del profesor, un admin puede activar cualquier oferta desde una ruta global | `controllers/CatalogOfferController.java` (`updateOfferStatus`) |
| Código | Una ruta impide reactivar una oferta vencida y las otras dos no | `services/impl/CourseCatalogManageServiceImpl.java` (`validateReactivation`) |

## Qué hace hoy el código
- No se publica ningún evento al crear ni al activar una oferta.
- Una oferta queda activa apenas se crea: no hay estado de borrador (`entities/CourseCatalogOfferEntity.java`, `active` vale `TRUE` por defecto).
- Hay tres caminos que activan una oferta, todos en `services/impl/CourseCatalogManageServiceImpl.java`:
  - `updateOfferStatusForCourse`, la ruta del curso (profesor o admin);
  - `updateOfferStatus`, la ruta global, solo para admin;
  - `updateOffer`, con el campo `active` en el cuerpo.
- Mercado no conoce la lista de alumnos de un curso: `clients/CourseEnrollmentClient.java` solo responde si un alumno está inscripto, y hoy es un mock ([[S2-02 - Clientes reales de Cursos]]).
- Las ofertas pueden vencer por fecha (`publicationExpiresAt`, [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]).

## Opciones

### 1. ¿Uno o dos eventos?
1. **Dos eventos, `CATALOG_OFFER_PUBLISHED` y `CATALOG_OFFER_REACTIVATED`**: cada hecho tiene su nombre y Notificaciones puede redactar textos distintos sin leer campos. Desventaja: dos tipos para mantener.
2. **Un evento `CATALOG_OFFER_PUBLISHED` con un campo `trigger` (`NEW` o `REACTIVATED`)**: un solo tipo. Desventaja: Notificaciones tiene que mirar el campo para cambiar el texto.

### 2. ¿Quién arma la lista de destinatarios?
1. **Mercado manda solo `courseId` y Notificaciones resuelve los alumnos con Cursos**: respeta la historia y que Cursos sea el dueño de la lista. Desventaja: Notificaciones tiene que cambiar su regla BR-01 y su listener.
2. **Mercado consulta a Cursos y manda `studentIds`**: encaja con lo que Notificaciones ya implementó. Desventajas: necesita un endpoint de Cursos para listar alumnos (hoy no existe en el cliente de Mercado), el mensaje crece con el tamaño del curso y la lista queda congelada al momento de publicar.

### 3. ¿La activación global del admin también avisa?
1. **Sí**: para el alumno es una oferta nueva, sin importar quién la activó.
2. **No**: se respeta al pie de la letra la historia, que nombra solo al profesor.

### 4. ¿Reactivar una oferta vencida por fecha cuenta como reactivación?
Hoy el código es inconsistente: `updateOffer` rechaza reactivar una oferta vencida ("Una oferta vencida no puede reactivarse; publique una nueva oferta", `validateReactivation`), pero las dos rutas de estado (`updateOfferStatus` y `updateOfferStatusForCourse`) no hacen esa validación y la dejan activa.

1. **No aplica: una oferta vencida no se reactiva por ningún camino**: se agrega la validación a las rutas de estado y el aviso solo cubre ofertas pausadas. Es lo que ya dice `updateOffer`.
2. **Sí**: para el alumno vuelve a estar disponible. Implica quitar la validación de `updateOffer`.

## Recomendación
Sin recomendación cerrada: es una discusión del equipo. La pregunta 2 hay que llevarla a Notificaciones con una postura de Mercado ya definida, porque cambia su listener.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado, las cuatro preguntas. La 2 se negocia además con Notificaciones ([[Integración con Notificaciones]]) y con Cursos ([[Integración con Cursos]]).

## Resolución
Pendiente.
