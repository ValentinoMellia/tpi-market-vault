---
tipo: historia
estado: vigente
verificado_contra: codigo@e63dcb47
actualizado: 2026-10-26
tags: [mercado, backlog, sprint-3, cofres]
sprint: 3
taiga: "#12002"
puntos: 8
---
# S3-02 - Cofres, el profesor crea y gestiona

> US-12002 de Taiga: primera historia de la fase 1 de los [[Cofre|cofres]], solo con premios de ítem. El profesor crea cofres a precio fijo con premios copiados de las ofertas del curso, los edita, los publica, los desactiva y descarta borradores. Sus siete tasks están mergeadas en `develop` de `tpi-market`. La vista del alumno sigue en [[S3-03 - Cofres, el alumno ve los cofres del curso]].

## [G11] — Cofres: el profesor crea y gestiona cofres con premios de ítem

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor de un curso
- **Quiero**: crear cofres a precio fijo con premios de ítem (equipamiento o vidas de las ofertas del curso), editarlos, publicarlos y desactivarlos
- **Para**: ofrecer a mis alumnos una compra con premio al azar, con reglas y probabilidades que yo controlo

Es la H1 de [[DEC-035 - Cofres en dos fases]], adelantada al Sprint 3 por [[DEC-042 - Fase 1 de cofres en el Sprint 3]]. Las reglas vienen de [[DEC-031 - Cofres configurables con ítems, monedas y XP]] y [[DEC-032 - Sorteo y reglas de configuración de los cofres]]. Se cargó en Taiga el 2026-10-21 en `G11 - Sprint 03`, con 8 puntos, asignada a Patricio Fernandez.

---

## Criterios de aceptación (CA)

Resumidos de Taiga, con dónde quedaron cubiertos:

- [x] **CA1**: cada validación responde 400 `problem+json` con el campo que falla. Cubierto por T02, T03 y T06, y de punta a punta en la T07.
- [x] **CA2**: un premio de monedas o de XP responde 400 (fase 2). Cubierto por T03.
- [x] **CA3**: editar o desactivar la oferta de origen no cambia la copia guardada, y crear el cofre no descuenta stock. Cubierto por T04 y T05.
- [x] **CA4**: la respuesta trae la rareza sugerida de cada premio y los avisos, sin impedir guardar. Cubierto por T03.
- [x] **CA5**: quien no es profesor del curso recibe 403; un cofre de otro curso o descartado, 404. Cubierto por T05 y T06.
- [x] **CA6**: DTO en `snake_case` con `@JsonProperty`, el paquete agregado a `SnakeCaseContractTest` y OpenAPI documentado. Cubierto por T02 y T06.

La descripción de Taiga dice «sin máximo de cantidad» de premios. Hoy el tope es 100 ([[DEC-040 - Tope técnico de 100 premios por cofre]]). La descripción todavía no se corrigió en Taiga.

---

## Tareas

| # | Taiga | Tarea | PR de `tpi-market` | Change de OpenSpec | Estado |
|---|---|---|---|---|---|
| T01 | #12005 | Modelo y migración V16 (`chests`, `chest_rewards`) | [259](https://github.com/2026-P4-BE/tpi-market/pull/259) | `us-12002-t01-chest-model` | Mergeada el 2026-10-21; Closed |
| T02 | #12006 | DTO de gestión (`snake_case`, entrada estricta) | [263](https://github.com/2026-P4-BE/tpi-market/pull/263) | `us-12002-t02-chest-dtos` | Mergeada el 2026-10-21; Closed |
| T03 | #12007 | Reglas, rareza sugerida y avisos que no bloquean | [264](https://github.com/2026-P4-BE/tpi-market/pull/264) | `us-12002-t03-chest-rules` | Mergeada el 2026-10-22; Closed |
| T04 | #12008 | Copia de la oferta sin consumir stock | [268](https://github.com/2026-P4-BE/tpi-market/pull/268) | `us-12002-t04-chest-prize-copy` | Mergeada el 2026-10-22; Closed |
| T05 | #12009 | Servicio de gestión: crear, editar, publicar, desactivar y descartar | [270](https://github.com/2026-P4-BE/tpi-market/pull/270) | `us-12002-t05-chest-manage-service` | Mergeada el 2026-10-22, con la review de Patiño; Closed |
| T06 | #12010 | Controlador, autorización, errores, OpenAPI, listado y detalle | [278](https://github.com/2026-P4-BE/tpi-market/pull/278) | `us-12002-t06-chest-manage-controller` | Mergeada el 2026-10-22 (merge `e63dcb47`), con la review de Patiño; Closed |
| T07 | #12011 | Tests de punta a punta, concurrencia y matriz de roles | [282](https://github.com/2026-P4-BE/tpi-market/pull/282) | `us-12002-t07-chest-manage-tests` | Mergeada el 2026-10-23 (merge `21c728cf`), con la aprobación de Lozzano |

Fechas en hora de Argentina. Hay dos tasks de review en la misma historia:
- **#12232:** Patiño revisó la PR 259 y no encontró defectos bloqueantes.
- **#12838:** Martin Lozzano revisó la PR 270 y no encontró defectos bloqueantes. Patiño también revisó esa PR por GitHub y sumó commits propios.

---

## Qué quedó construido
El detalle del dominio está en [[Cofre]]; las reglas de edición, en [[DEC-041 - Edición de un cofre según su estado]]. Por task:

- **T01.** Migración Flyway `V16__chests_schema.sql`, entidades, enums y repositorios. DEC-035 hablaba de un script SQL manual. El cofre premio reutiliza `AuctionItemSnapshot` sin cambios, y el CHECK de `reward_kind` solo admite `ITEM`.
- **T02.** Un solo DTO para crear y reemplazar (PUT completo). Por el QA, la entrada es estricta: enteros exactos y campos desconocidos rechazados solo en estos DTO. También hay topes técnicos: peso hasta 1000 y hasta 100 premios.
- **T03.** `ChestRules` junta todos los errores en un 400 `chest-invalid-parameters` y sugiere la rareza. `ChestEvaluator` calcula las probabilidades y los avisos.
- **T04.** `ChestPrizeResolver` copia las ofertas en una sola consulta de lectura. Acepta ofertas inactivas o vencidas, y el aviso `OFFER_SOLD_OUT` lo agregó el QA.
- **T05.** `ChestManageService`, con las reglas de [[DEC-041 - Edición de un cofre según su estado]]. 72 tests nuevos, en H2 y en PostgreSQL. El QA probó una carrera real entre dos profesores, que responde 409.
- **T06.** `CourseChestManageController` con las siete rutas, autorización con `ChestAccessGate` en el controlador, cuatro problemas propios y ejemplos en OpenAPI. El QA por HTTP real encontró un 500 con una página enorme, y se corrigió: ahora responde 400 en `page`.
- **T07.** Prueba por HTTP real los CA1 a CA5 y los BDD 1 a 3, en H2 y en PostgreSQL con Flyway.
  - Concurrencia: de 8 ediciones con la misma versión, una sola gana. Al publicar y editar a la vez, nunca hay un 5xx.
  - Matriz de roles: suma las siete rutas de cofres.
  - Mutaciones de TDD: diez mutaciones, todas detectadas.
  - Cobertura de las clases `Chest*`: 99,6 % de líneas.

**Calidad.** Checkstyle, PMD y javadoc pasan en todas las tasks. Desde la T04, la suite completa da 44 errores que ya existían en `develop`. Vienen de la base H2 compartida entre contextos de Spring: issue [269](https://github.com/2026-P4-BE/tpi-market/issues/269) de `tpi-market`, abierta. El CI de GitHub no corrió en ninguna de estas PRs por un problema de facturación de la organización.

---

## Reviews

- **PR 259** (Patiño): aprobada sin pedidos.
- **PR 263 y 264** (Kimmel): aprobadas sin pedidos.
- **PR 268** (Wiesek): aprobada, con notas que no bloquean: anotar `OFFER_SOLD_OUT` en el vault y arreglar aparte los 44 errores de H2.
- **PR 270** (Wiesek, Lozzano y Patiño):
  - Patiño cambió a `snake_case` los campos de los errores de negocio de cofres.
  - Dejó sin cambiar, como pendientes:
    - Bean Validation en `camelCase` ([[Q-033 - Nombres de campo en los errores de validación]]).
    - `markEdited()` frente a `OPTIMISTIC_FORCE_INCREMENT`.
    - La falta de `version` en publicar, desactivar y descartar.
    - `OFFER_SOLD_OUT` sin recalcular.
  - Wiesek avisó que `ChestPrizeMerger` falla con un premio sin oferta, un riesgo para la fase 2.
- **PR 278** (Patiño):
  - Movió la autorización al controlador, fuera de la transacción, y documentó que la membresía está memoizada por request.
  - Aclaró en OpenAPI cuándo viene `currentVersion` y tipó el esquema de la página (`ChestPageResponse`).

---

## Pendientes
Ninguno bloquea la historia. Están registrados para no perderlos:

- **De dominio:** la falta de `version` en publicar, desactivar y descartar; `markEdited()`; `OFFER_SOLD_OUT` sin recalcular; el cofre corrupto que rompería el listado, y el riesgo de `ChestPrizeMerger` en la fase 2. Ver [[Cofre]].
- **Campos de error mezclados:** [[Q-033 - Nombres de campo en los errores de validación]].
- **OpenAPI desactualizado:** los ejemplos de cofres en `configs/SpringDocConfig.java` siguen en `camelCase`, y el código emite `snake_case`.
- **Artefactos de OpenSpec desactualizados:**
  - Los de la T06 (design, specs, proposal, exploration y verify-report) y el design de la T05 dicen que el servicio autoriza. Desde la review de la PR 278 autoriza el controlador.
  - La descripción de la PR 278 también quedó vieja.
  - Los artefactos de la T03 y la T04 nombran los campos de error en `camelCase`.
- **500 por página enorme** en `/auctions/drafts`, `/goals` y `/orders`: no se abrió issue, a propósito. Ver [[Estado actual del código]].
- **Matriz de roles:** las filas de `ADMIN` de metas y ofertas del grupo 4 apuntan al curso archivado y no prueban el bypass.
- **Issue 269** (44 errores de H2), abierta.
- **`GESTOR`:** en cofres, una membresía `GESTOR` responde 403, como en metas y ofertas ([[DEC-021 - Acceso al mercado por membresía de Cursos]], [[Q-024 - Qué es el rol GESTOR]]). La PR #56 del vault (DEC-037, abierta) lo trata como docente en las subastas.

---

## Lo que sigue

- **US-12003, el alumno ve los cofres del curso** (H2, Sprint 3, 3 puntos): en [[S3-03 - Cofres, el alumno ve los cofres del curso]].
- **US-12004, el alumno compra un cofre** (H3, Sprint 3, 8 puntos): hecha, en [[S3-04 - Cofres, el alumno compra un cofre]]. El sorteo guardado de una orden referencia el premio por `reward_id`, por eso los premios quitados se marcan `deleted` y no se borran.
- **Frontend H4 y H5** de [[DEC-035 - Cofres en dos fases]]: las pantallas de gestión del profesor con la API real están en la #14120 (Kimmel, en curso).
- **Fase 2 (H6), monedas y XP:** cuando Accounting y Roadmap tengan su parte ([[DEC-033 - Acreditación de XP de cofre en Roadmap]], [[DEC-034 - Acreditación de premios de cofre en Accounting]]). Amplía el CHECK de `reward_kind` y suma `amount`.

La US-12003 reusó el soporte de pruebas de `ChestManageAcceptanceTest`, que su T04 movió a `ChestAcceptanceSupport`: cursos propios, ofertas completas y limpieza. La US-12004 puede reusarlo igual.

Relación: [[Cofre]], [[Cofres y nuevos ítems]], [[Backlog - Índice]], [[S3-01 - Subastas, lanzar y ver las abiertas]].
