---
tipo: decision
estado: vigente
verificado_contra: codigo@eae241f2
actualizado: 2026-10-24
tags: [mercado, decision, cofres, limite]
---
# DEC-045 - Período del límite de compras de un cofre

> El límite por alumno de un cofre se cuenta desde las 00:00 de hoy (`DAY`), desde el lunes 00:00 de esta semana (`WEEK`) o desde siempre (`COHORT`), con la hora de Buenos Aires. La vista del alumno y el bloqueo de la compra usan el mismo corte.

## Contexto
[[DEC-032 - Sorteo y reglas de configuración de los cofres]] permite un límite opcional por alumno con un período (`DAY`, `WEEK` o `COHORT`), pero no dice cuándo empieza cada período ni en qué zona horaria. La US-12003 informa cuántos cofres le quedan al alumno en el período, y la US-12004 (#12018) bloquea la compra sin cupo: tienen que contar igual. El QA de la #12005 (modelo de cofres) lo había dejado pendiente.

El equipo de Mercado (Patricio Fernandez) lo decidió el 2026-10-23, en la exploración de la T02 de la US-12003 (#12013, change `us-12003-t02-chest-student-query`, PR 290 de `tpi-market`).

## Decisión
- **Zona:** `America/Argentina/Buenos_Aires`, la misma del corte de cohortes (`CohortCutoffResolver.COHORT_ZONE`). El inicio del período se convierte a la zona del `Clock` de la aplicación, que es la de las fechas guardadas.
- **`DAY`:** desde las 00:00 de hoy.
- **`WEEK`:** desde el lunes 00:00 de la semana en curso.
- **`COHORT`:** sin cota inferior (`null`). Un cofre pertenece a un curso, que es una cohorte, así que todas sus órdenes ya son de esa cursada. No se consulta a Cursos.
- **Un solo componente** para la vista y la compra: `services/impl/ChestLimitPeriodResolver.java`. El conteo va por el puerto `services/ChestPurchaseCounter.java`, desde el inicio del período inclusive.

## Alternativas descartadas
- **Zona de la JVM:** el corte del día cambiaría según dónde corra el servicio.
- **Semana móvil de 7 días:** menos predecible para el alumno que «esta semana».
- **`COHORT` con las fechas de la cursada pedidas a Cursos:** una llamada más sin ganancia, porque el cofre ya es de un solo curso.

## Consecuencias
- **Hoy:** el contador activo es `services/impl/NoChestOrdersPurchaseCounter.java`, que devuelve 0 compras porque todavía no se pueden comprar cofres. Por eso `remaining_in_period` es siempre igual a `max_per_student`, y el corte del período todavía no se ve por HTTP (lo prueba `ChestLimitPeriodResolverTest`, incluidos los cambios de horario de otras zonas).
- **US-12004 (#12018):** reemplaza ese contador por uno sobre las órdenes de cofre con este mismo corte y decide qué estados de orden consumen cupo. Las consultas que dejó la #12016 (`OrderRepository.countChestPurchases` y `countChestPurchasesBatch`) fallan en PostgreSQL con `sinceCutoff` nulo, que es justo el caso `COHORT` (issue https://github.com/2026-P4-BE/tpi-market/issues/303).

## Notas afectadas
[[Cofre]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[S3-03 - Cofres, el alumno ve los cofres del curso]], [[Decisiones - Índice]].
