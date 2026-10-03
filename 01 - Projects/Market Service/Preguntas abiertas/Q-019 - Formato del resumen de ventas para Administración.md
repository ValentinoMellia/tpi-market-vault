---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@276af52
actualizado: 2026-10-03
tags: [mercado, pregunta-abierta, reportes, backlog]
---
# Q-019 - Formato del resumen de ventas para Administración

> La PR #85 de `tpi-market` expone un resumen de ventas por curso para el profesor, pero la historia #1053 pide acordar el formato final del reporte con Administración y eso no se hizo. Además #1053 figura en Taiga como candidata a volver al backlog ([[Q-018 - Alcance real del Sprint 2 en Taiga]]). Hay que decidir si el formato propio de Mercado alcanza y si la historia sigue en el sprint.

## Qué se contradice

| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Historia #1053, tarea 1062 (T01) | El formato del reporte se acuerda con Administración antes de construirlo | Taiga, épica #1050; [[Revisión del Sprint 2 en Taiga]] |
| PR #85 | Se expone solo el resumen propio de Mercado, "como permite la historia mientras tanto"; el formato no se acordó | PR #85 de `tpi-market` (descripción, "Known gaps") |
| Revisión del backlog | #1053 se mueve al backlog y se corrige la ruta | [[Revisión del Sprint 2 en Taiga]], [[Q-018 - Alcance real del Sprint 2 en Taiga]] |
| Taiga, prototipo de #1053 | Ruta `GET /api/cursos/{cursoId}/mercado/resumen` | [[Revisión del Sprint 2 en Taiga]] |
| Decisión vigente | Prefijo `/api/market/...` | [[DEC-005 - Endpoints y prefijos según el código]] |

## Qué hace hoy el código

- `develop` (`276af52`) no tiene este endpoint. La PR #85 (borrador, cabeza `9b846cb`) agrega `GET /api/market/courses/{courseId}/sales/summary?from&to` con `CourseSalesSummaryController`, `CourseSalesSummaryServiceImpl` y la consulta `OrderRepository.summarizeSales`.
- Respuesta en `snake_case`: `course_id`, `from`, `to`, `total_coins_spent`, `confirmed_orders`, `failed_orders`, `offers[]` (`offer_id`, `offer_name`, `units_sold`, `coins_spent`) y `failures[]` (`reason`, `count`). No incluye datos de alumnos.
- Las unidades vendidas son las órdenes `CONFIRMED` de cada oferta; no usa `unitsSold`, que nunca se incrementa (gap 4 de [[Estado actual del código]]). El período se aplica sobre la fecha de creación de la orden.
- Las compras rechazadas por falta de stock se responden 409 al crear la orden y no se guardan, así que no figuran en `failures`.
- Acceso: PROFESSOR solo de sus cursos, ADMIN y GESTOR de todos. La revisión de la PR encontró que el control de roles usa `contains()`: ver [[Revisión de PRs abiertas (2026-10-03)]].

## Opciones

1. **(a) Aceptar el formato propio de Mercado como definitivo.** A favor: ya está implementado y probado, y evita depender de otro equipo. En contra: si Administración consolida reportes de todos los módulos, podría pedir otra forma.
2. **(b) Acordar el formato con Administración antes de mergear la PR.** A favor: cumple la tarea 1062 tal como está escrita. En contra: bloquea una PR terminada hasta tener respuesta y [[Integración con Backoffice]] no documenta ningún contrato de reportes de Administración.
3. **(c) Mergear el formato propio como versión inicial y registrar el acuerdo con Administración como tarea posterior.** A favor: no frena el trabajo y deja el cambio de formato como evolución del contrato. En contra: un cambio posterior rompe a los clientes que ya consuman el endpoint (el frontend usa `snake_case` desde #76).

## Recomendación

Opción (c), siempre que antes se corrija el parseo de roles de la PR #85 y se registre en Taiga que el formato no está acordado. Es una recomendación de la revisión, no una decisión.

## Quién decide / con qué equipo hay que hablar

- Equipo de Mercado: líder y Product Owner (alcance de #1053 dentro del Sprint 2, junto con [[Q-018 - Alcance real del Sprint 2 en Taiga]]).
- Administración: formato final del reporte.
- Frontend: si el selector de cohortes o el panel del profesor va a consumir el endpoint.

## Resolución

Pendiente. Al decidir se registra una `DEC-NNN`, se archiva esta pregunta y se actualizan [[Revisión de PRs abiertas (2026-10-03)]] y [[Revisión del Sprint 2 en Taiga]].
