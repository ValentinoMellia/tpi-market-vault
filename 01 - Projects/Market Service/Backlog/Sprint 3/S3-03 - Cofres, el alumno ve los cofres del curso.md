---
tipo: historia
estado: vigente
verificado_contra: codigo@eae241f2
actualizado: 2026-10-24
tags: [mercado, backlog, sprint-3, cofres]
sprint: 3
taiga: "#12003"
puntos: 3
---
# S3-03 - Cofres, el alumno ve los cofres del curso

> US-12003 de Taiga, segunda historia de la fase 1 de los [[Cofre|cofres]]: el alumno lista los cofres publicados de su curso y abre el detalle de cada uno, con los premios, su rareza y, si el profesor lo permite, la probabilidad de cada premio. Tres de sus cuatro tasks están mergeadas en `develop` de `tpi-market`; la de tests de punta a punta (PR 306) está abierta.

## [G11] — Cofres: el alumno ve los cofres del curso con sus premios y probabilidades

---

## Descripción (Como / Quiero / Para)

- **Como**: alumno de un curso
- **Quiero**: ver los cofres publicados de mi curso, con sus premios, su rareza y, si el profesor lo permite, la probabilidad de cada uno
- **Para**: decidir si compro un cofre sabiendo qué me puede tocar

Es la H2 de [[DEC-035 - Cofres en dos fases]], adelantada al Sprint 3 por [[DEC-042 - Fase 1 de cofres en el Sprint 3]]. Es la fuente de datos de la pantalla de cofres del alumno del frontend (task 10426), que usaba datos de prueba. Se cargó en Taiga el 2026-10-21 en `G11 - Sprint 03`, con 3 puntos, asignada a Patricio Fernandez.

---

## Criterios de aceptación (CA)

Resumidos de Taiga, con dónde quedaron cubiertos:

- [x] **CA1**: un cofre en borrador o desactivado no aparece en el listado y su detalle responde 404. Cubierto por T02 y T03, y de punta a punta en la T04 (PR abierta).
- [x] **CA2**: con el interruptor apagado no viajan probabilidades; encendido, las de un cofre suman 1 con el redondeo documentado ([[DEC-044 - Redondeo de las probabilidades de un cofre]]). Cubierto por T01 y T02, y en la T04 con siete cofres de ejemplo leídos del JSON crudo.
- [x] **CA3**: quien no es alumno del curso recibe 403; con el mercado deshabilitado, el mismo error que la tienda. Cubierto por T03 y en la T04 por HTTP real.
- [x] **CA4**: DTO en `snake_case` con `@JsonProperty`, el paquete en `SnakeCaseContractTest` y OpenAPI documentado. Cubierto por T01 y T03; `swagger.json` se sincronizó en la T04.

Escenarios BDD:
- [x] **BDD 1** (interruptor encendido: cada premio con su rareza y su probabilidad) y **BDD 2** (apagado: premios y rareza, sin probabilidades): cubiertos en la T04.
- [ ] **BDD 3** (límite de 2 por semana y una compra hecha: queda 1). **Pasó a la US-12004.** Hoy no se puede comprar un cofre y el contador de compras devuelve siempre 0; lo verifica la #12018 cuando conecte el conteo real ([[DEC-045 - Período del límite de compras de un cofre]]).

---

## Tareas

| # | Taiga | Tarea | PR de `tpi-market` | Change de OpenSpec | Estado |
|---|---|---|---|---|---|
| T01 | #12012 | DTO de la vista del alumno | [285](https://github.com/2026-P4-BE/tpi-market/pull/285) | `us-12003-t01-chest-student-dtos` | Mergeada el 2026-10-23; Closed |
| T02 | #12013 | Consulta, redondeo, período y cupo | [290](https://github.com/2026-P4-BE/tpi-market/pull/290) | `us-12003-t02-chest-student-query` | Mergeada el 2026-10-23, con un commit de Wiesek (cupo en lote); Closed |
| T03 | #12014 | Controlador, acceso y OpenAPI | [295](https://github.com/2026-P4-BE/tpi-market/pull/295) | `us-12003-t03-chest-student-controller` | Mergeada el 2026-10-23 (merge `f00b3a80`); Closed |
| T04 | #12015 | Tests de punta a punta, matriz de roles y `swagger.json` | [306](https://github.com/2026-P4-BE/tpi-market/pull/306) | `us-12003-t04-chest-student-tests` | Abierta y sin review al 2026-10-24; Ready for test |

Fechas en hora de Argentina.

---

## Qué quedó construido
El detalle del dominio está en [[Cofre]], sección «Vista del alumno». Por task:

- **T01.** Tres records en `dtos/chests`: `ChestStudentViewDto`, `ChestStudentPrizeDto` y `ChestStudentLimitDto`. No muestran pesos, `item_value` ni `source_offer_id`. `probability` tiene escala fija de 2 y no viaja si es `null`; `remaining_in_period` nunca pasa de `max_per_student`.
- **T02.** `ChestStudentQueryServiceImpl`: solo cofres `PUBLISHED` no descartados del curso, ordenados por id. Trajo dos decisiones:
  - el redondeo por mayor resto con mínimo de 0,01, que también cambió dos valores del profesor ([[DEC-044 - Redondeo de las probabilidades de un cofre]]);
  - el período del límite en hora de Buenos Aires ([[DEC-045 - Período del límite de compras de un cofre]]).

  Un cofre publicado que no se puede sortear se saltea con un `WARN` y su detalle da 404; los premios de una rareza con peso 0 no se muestran. El cupo pasa por el puerto `ChestPurchaseCounter`, hoy con `NoChestOrdersPurchaseCounter` (0 compras). El QA comparó 6000 cofres al azar contra un oráculo con fracciones exactas.
- **T03.** `CourseChestStudentController` bajo `/catalog/chests` y `ChestStudentAccessGate`: una sola regla para listado y detalle, el acceso antes de buscar el cofre (403 antes que 404) y el `GESTOR` chequeado como alumno ([[DEC-021 - Acceso al mercado por membresía de Cursos]]). El QA por HTTP real (62 pedidos) encontró que un `Accept` no JSON caía en el detalle de la tienda; se sacó el `produces` y ahora responde 406.
- **T04 (abierta).** Prueba por HTTP real CA1 a CA4 y BDD 1 y 2, en H2 y en PostgreSQL con Flyway, sobre una base compartida con la aceptación de la US-12002 (`ChestAcceptanceSupport`).
  - Siete cofres de ejemplo con sus probabilidades exactas, incluido uno que necesita el mínimo de 0,01.
  - Los datos publicados del cofre y la copia congelada del premio, vistos por el alumno.
  - Las dos rutas en la matriz de roles y en `MissingUserIdAcceptanceTest`.
  - Cada regla probada con una mutación temporal que pone algún test en rojo.
  - `swagger.json` regenerado: además de estas rutas trajo lo que otras PRs no habían sincronizado (órdenes de cofre de la #12016 y tres códigos de subastas).

**Calidad.** Checkstyle, PMD y javadoc pasan en las cuatro tasks. La suite completa de la T04 (8609 tests, con Docker) falla en `ChestOrderDrawMigrationPostgresTest`, que ya falla en `develop` (ver *Pendientes*), y en un test de Kafka intermitente. El CI de GitHub no corrió en ninguna de estas PRs por la facturación de la organización.

---

## Reviews

- **PR 285** (Lozzano): aprobada sin pedidos.
- **PR 290** (Wiesek): aprobada sin bloqueantes. Sumó un commit propio: el cupo se cuenta en una llamada por período y no cofre por cofre.
- **PR 295** (Patiño): aprobada; pidió regenerar `swagger.json` en la #12015, que lo hizo.

---

## Pendientes
Ninguno bloquea la historia:

- **BDD 3** y el reemplazo de `NoChestOrdersPurchaseCounter`: #12018 de la US-12004.
- **Issue [303](https://github.com/2026-P4-BE/tpi-market/issues/303) de `tpi-market`:** las consultas de conteo de compras que dejó la #12016 (`OrderRepository.countChestPurchases` y `countChestPurchasesBatch`) fallan en PostgreSQL con un período sin cota (`COHORT`), y tres casos de `ChestOrderDrawMigrationPostgresTest` están rotos. Conviene resolverlo antes de la #12018.
- **`GESTOR`:** no inscripto recibe 403 en los cofres y 200 en el detalle de la tienda. La matriz de roles lo deja marcado con [[Q-024 - Qué es el rol GESTOR]].
- **Issue 269** (44 errores de H2), abierta; no apareció en las corridas de esta historia.

---

## Lo que sigue

- **US-12004, el alumno compra un cofre** (H3, Sprint 3, 8 puntos): sorteo al crear la orden con los pesos exactos ([[DEC-044 - Redondeo de las probabilidades de un cofre]]), control del límite con el corte de [[DEC-045 - Período del límite de compras de un cofre]] y la saga de entrega. La #12016 (orden con el resultado del sorteo, V23) ya está en `develop`.
- **Frontend:** la pantalla de cofres del alumno (task 10426) puede dejar los datos de prueba. Rutas: `GET /api/market/courses/{courseId}/catalog/chests` y `/{chestId}`, lista simple con el mismo DTO.

Relación: [[Cofre]], [[S3-02 - Cofres, el profesor crea y gestiona]], [[Cofres y nuevos ítems]], [[Backlog - Índice]].
