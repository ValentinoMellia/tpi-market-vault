---
tipo: historia
estado: vigente
verificado_contra: codigo@5fb82d80
actualizado: 2026-10-26
tags: [mercado, backlog, sprint-3, cofres, saga]
sprint: 3
taiga: "#12004"
puntos: 8
---
# S3-04 - Cofres, el alumno compra un cofre

> US-12004 de Taiga, tercera y última historia del backend de la fase 1 de los [[Cofre|cofres]]: el alumno compra un cofre, Mercado controla el límite, sortea el premio y lo guarda con la orden, y la saga cobra el precio del cofre y entrega el equipamiento o la vida que salió. Las cinco tasks con código están mergeadas en `develop` de `tpi-market`; la de tests se cerró cubierta por ellas. La US está en Done.

## [G11] — Cofres: el alumno compra un cofre y recibe un premio de ítem sorteado

---

## Descripción (Como / Quiero / Para)

- **Como**: alumno de un curso
- **Quiero**: comprar un cofre y recibir el premio que me tocó
- **Para**: obtener equipamiento o vidas con una compra al azar a precio fijo

Es la H3 de [[DEC-035 - Cofres en dos fases]], adelantada al Sprint 3 por [[DEC-042 - Fase 1 de cofres en el Sprint 3]]. Reusa la saga de la compra directa: el sorteo y su resultado son de [[DEC-032 - Sorteo y reglas de configuración de los cofres]], el cobro es un hold por el precio del cofre y la entrega sigue [[DEC-025 - Saga de compra de ítems según la Propuesta C]] (equipamiento) o [[DEC-007 - Tope de vidas, Accounting decide y reporta]] (vida), como acordó [[DEC-034 - Acreditación de premios de cofre en Accounting]]. Sin cambios en Accounting. Se cargó en Taiga el 2026-10-21 en `G11 - Sprint 03`, con 8 puntos, asignada a Patricio Fernandez.

---

## Criterios de aceptación (CA)

Resumidos de Taiga, con dónde quedaron cubiertos:

- [x] **CA1**: dos llamadas con la misma clave de idempotencia devuelven la misma orden con el mismo premio. T04 (`ChestPurchaseAcceptanceTest`, y seis pedidos simultáneos con la misma clave en `ChestPurchaseSagaPostgresTest`); T05 con el cofre cambiado, el límite usado o la orden terminada.
- [x] **CA2**: con semilla fija, 10 000 sorteos respetan los pesos con tolerancia documentada; una rareza sin premios nunca sale. T02 (`ChestDrawerDistributionTest`: 20 semillas, ±4σ de la binomial).
- [x] **CA3**: superado el límite, la compra se rechaza antes de crear la orden y el hold. Guard en la T03; cableado y probado por HTTP en la T04, con seis compras simultáneas contra un límite de 1.
- [x] **CA4**: un equipamiento llega a Accounting con la configuración copiada y la orden termina `CONFIRMED`; si falla la acreditación, se cancela y se libera el hold. T04 (`ChestPurchaseSagaAcceptanceTest`, también en PostgreSQL).
- [x] **CA5**: una vida publica `LIFE_PURCHASE_CONFIRMED` solo después de `HOLD_CONFIRMED`. T04, y en la T05 sin duplicados ante eventos repetidos.
- [x] **CA6**: la orden y su SSE incluyen el premio en `snake_case`. T01 (DTO) y T04 (lectura), con la regla de [[DEC-047 - Cuándo ve el alumno el premio de un cofre]].

Escenarios BDD:
- [x] **BDD 1** (compra, saga y orden `CONFIRMED` con el ítem acreditado): T04.
- [x] **BDD 2** (un reintento o la conciliación no cambian el premio): T05, en cada camino que reintenta o concilia.
- [x] **BDD 3** (límite de 1 por día ya usado: se rechaza sin orden ni hold): T03 y T04. También quedó cubierto el BDD 3 de la US-12003 ([[S3-03 - Cofres, el alumno ve los cofres del curso]]).

---

## Tareas

| # | Taiga | Tarea | PR de `tpi-market` | Change de OpenSpec | Estado |
|---|---|---|---|---|---|
| T01 | #12016 | Resultado del sorteo en la orden y migración | [293](https://github.com/2026-P4-BE/tpi-market/pull/293) | `us-12004-t01-chest-order-draw` | Mergeada el 2026-10-23; Closed |
| T02 | #12017 | Sorteo: rareza por pesos y premio en partes iguales | [309](https://github.com/2026-P4-BE/tpi-market/pull/309) | `us-12004-t02-chest-draw` | Mergeada el 2026-10-24; Closed |
| T03 | #12018 | Límite por alumno y período antes de crear la orden | [313](https://github.com/2026-P4-BE/tpi-market/pull/313) | `us-12004-t03-chest-purchase-limit` | Mergeada el 2026-10-25; Closed |
| T04 | #12019 | Compra en la saga: hold por el precio y entrega | [321](https://github.com/2026-P4-BE/tpi-market/pull/321) | `us-12004-t04-chest-purchase-saga` | Mergeada el 2026-10-26; Closed |
| T05 | #12020 | Reintentos y conciliación con el premio guardado | [322](https://github.com/2026-P4-BE/tpi-market/pull/322) | `us-12004-t05-chest-stored-prize-retries` | Mergeada el 2026-10-26; Closed |
| T06 | #12021 | Tests del sorteo, del límite y de la saga | Sin PR propia | — | Closed el 2026-10-26, cubierta por T02 a T05 |
| — | #14113 | Tolerancia del sobre de Kafka y constraints del sorteo en PostgreSQL (Kimmel) | [320](https://github.com/2026-P4-BE/tpi-market/pull/320) | — | Mergeada el 2026-10-25; Closed |

Fechas en hora de Argentina. La #14113 la cargó Kimmel dentro de la US para la PR 320, que cerró la issue [303](https://github.com/2026-P4-BE/tpi-market/issues/303) junto con la T03.

---

## Qué quedó construido
El detalle del dominio está en [[Cofre]], sección «Compra del alumno», y en [[Orden de compra]]. Por task:

- **T01.** La orden distingue `order_kind` `DIRECT` o `CHEST`, con `chest_id` y `offer_id` opcional según el tipo (CHECK `chk_orders_kind_consistency`). El premio sorteado se guarda en la tabla nueva `chest_order_draws` (`entities/ChestOrderDrawEntity.java`), una fila por orden (`UNIQUE (order_id)`), con el nombre del cofre, el nombre y la rareza del premio, `item_value` y la copia completa del ítem (`AuctionItemSnapshot`). Migración `V23__chest_order_draw.sql`, con el índice `idx_orders_chest_student_limit` para el conteo de compras. El resumen de ventas cuenta solo órdenes directas. `OrderChestRewardDto` expone el premio como `drawn_prize`.
- **T02.** `ChestDrawer` sortea con dos tiradas exactas: la rareza por peso entre las que tienen premios y después un premio de esa rareza en partes iguales. La regla de qué rarezas participan quedó en `ChestDrawWeights`, compartida con `ChestEvaluator`, así lo que el alumno ve es exactamente lo que se sortea ([[DEC-044 - Redondeo de las probabilidades de un cofre]]). El azar es un puerto (`ChestDrawRandomSource`) con `SecureRandom` en producción y semilla fija en los tests, como el dado de las subastas. 8 mutaciones detectadas.
- **T03.** `ChestPurchaseLimitGuard` rechaza con 422 `chest-limit-reached` (`MARKET_CHEST_LIMIT_REACHED`) si el alumno ya llegó al máximo en el período de [[DEC-045 - Período del límite de compras de un cofre]]. Cuentan `CONFIRMED` y los cinco estados en vuelo, los mismos del tope de vidas. `OrderChestPurchaseCounter` reemplazó al contador provisorio de la US-12003, así que la vista del alumno muestra el cupo real. Las dos consultas nuevas (con y sin inicio) arreglaron el problema 1 de la issue 303.
- **T04.** Endpoint `POST /api/market/courses/{courseId}/catalog/chests/{chestId}/orders` (`ChestPurchaseServiceImpl` y `ChestOrderPlacer`). En una transacción: lock del cofre, límite, sorteo, orden y sorteo guardado; el hold va después del commit. La saga entrega desde la copia guardada sin leer ninguna oferta. El premio se ve según [[DEC-047 - Cuándo ve el alumno el premio de un cofre]]. Detalle, historial y cancelación dejaron de dar 500 con órdenes sin oferta. La gestión de cofres rechaza ahora un premio boost TTL mientras el flag está apagado. 17 mutaciones detectadas.
- **T05.** `ChestOrderDrawEntity` pasó a `@Immutable`: Hibernate nunca actualiza un sorteo. 14 escenarios (H2 y PostgreSQL) prueban que el reintento de la compra, los tres jobs (vencimiento del hold, conciliación con Banco y plazo de confirmación) y los eventos repetidos usan el premio guardado y nunca llaman a `ChestDrawer`, más tres carreras en PostgreSQL.

**Calidad.** Checkstyle, PMD y javadoc pasan en las cinco PR. La suite completa de la T05 dio 9321 tests con fallas solo conocidas de `develop`: los 3 casos de la issue 303 (la rama no tenía la PR 320), dos de subastas reproducibles en `develop` sin issue, uno de la conciliación que depende del orden de ejecución y el canario intermitente de Kafka. El CI de GitHub no corrió en ninguna por la facturación de la organización.

---

## Reviews

- **PR 293** (Patiño): aprobada; corrigió el título al formato convencional.
- **PR 309, 313, 321 y 322** (Kimmel): aprobadas sin pedidos. En la 309 y la 313 integró `develop` en la rama (en la 313, con un conflicto de `swagger.json` resuelto a mano).

---

## Pendientes
Ninguno bloquea la historia:

- **Avisos a Notificaciones:** `PURCHASE_CONFIRMED` y `PURCHASE_FAILED` salen con `offer_id` `null` en una orden de cofre, y no hay aviso con el premio. Abierto en [[Q-034 - Avisos de Notificaciones para órdenes de cofre]].
- **Canario de Kafka para cofres:** la T06 se cerró sin él. Las sagas de cofre se prueban con el transporte mock y los handlers reales, no con un broker.
- **Vida en `HOLD_NOT_SETTLED` sin aviso al alumno** cuando la conciliación encuentra el hold liberado. Pasa igual con la vida directa; quedó para una task de vidas (D6 de la T05).
- **Resumen de ventas de cofres:** no existe; un cofre no suma ventas a ninguna oferta.
- **Fallas conocidas de la suite** sin issue: `AuctionClosureRacePostgresTest.closing_should_writeNoOtherTable` y `AuctionStudentUnenrolledAcceptanceTest.unenrollmentWithdrawsOnlyTheStudentsBidsAndTheAuctionsStayOpen`.
- **PR 276 de `tpi-market`** (borrador «DO NOT MERGE», adopción de identidad): toca `CourseChestStudentController`, `PurchaseIdempotencyContext` y `ChestOrderDrawEntity`.

---

## Lo que sigue

- **Frontend:** Kimmel tiene en curso la #14119 (vista de cofres y ruleta de apertura con la API real, US-12003) y la #14120 (pantallas de gestión del profesor, US-12002). La apertura se sigue por el SSE de la orden; el premio llega en `drawn_prize` con `status` `CONFIRMED`.
- **Fase 2 (H6), monedas y XP:** cuando Accounting y Roadmap tengan su parte ([[DEC-033 - Acreditación de XP de cofre en Roadmap]], [[DEC-034 - Acreditación de premios de cofre en Accounting]]).

Relación: [[Cofre]], [[Orden de compra]], [[S3-02 - Cofres, el profesor crea y gestiona]], [[S3-03 - Cofres, el alumno ve los cofres del curso]], [[Cofres y nuevos ítems]], [[Backlog - Índice]].
