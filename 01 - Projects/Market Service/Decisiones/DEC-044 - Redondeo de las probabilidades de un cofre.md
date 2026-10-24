---
tipo: decision
estado: vigente
verificado_contra: codigo@eae241f2
actualizado: 2026-10-24
tags: [mercado, decision, cofres, probabilidades]
---
# DEC-044 - Redondeo de las probabilidades de un cofre

> Las probabilidades de un cofre se muestran con 2 decimales y siempre suman exactamente 100,00: se reparten los centésimos que faltan por mayor resto, y un premio que puede salir nunca muestra menos de 0,01, descontado del premio más probable. Vale para el profesor y para el alumno. El sorteo usa los pesos exactos, nunca estos porcentajes.

## Contexto
[[DEC-032 - Sorteo y reglas de configuración de los cofres]] fija cómo se calcula la probabilidad de un premio (peso de su rareza ÷ suma de los pesos de las rarezas con premios ÷ premios de esa rareza), pero no cómo se redondea. Hasta la US-12002 cada premio se redondeaba por separado a 2 decimales y con un mínimo de 0,01, así que un cofre podía sumar 99,99 o 100,40. La US-12003 (vista del alumno, [[S3-03 - Cofres, el alumno ve los cofres del curso]]) pide en su CA2 que las probabilidades de un cofre sumen 1, con el redondeo documentado.

El equipo de Mercado (Patricio Fernandez) lo decidió el 2026-10-23, en la exploración de la T02 (#12013, change `us-12003-t02-chest-student-query`, PR 290 de `tpi-market`). El desempate del mínimo se ajustó en el QA de esa misma task.

## Decisión
Todo en centésimos y con fracciones exactas (`services/impl/ChestProbabilityRounding.java`, llamado desde `services/impl/ChestEvaluator.java`):

1. **Valor exacto** de cada premio que puede salir: `peso × 10000 / (W × premios de su rareza)`, con `W` = suma de los pesos de las rarezas que tienen premios.
2. **Mayor resto.** Se toma la parte entera de cada uno y los centésimos que faltan para llegar a 100,00 se reparten de a uno entre los premios con mayor resto. Empate: el primero de la lista (`position` y después `id`).
3. **Mínimo de 0,01.** Un premio que puede salir y quedó en 0,00 pasa a 0,01. Cada centésimo se descuenta del premio más probable en ese momento. Empate: el de menor valor exacto y, después, el último de la lista. Este desempate evita que un premio más probable termine mostrado por debajo de uno menos probable (el QA encontró ese caso con el criterio «el primero de la lista»).
4. Un premio de una rareza con peso 0 queda en 0,00 y una rareza con peso y sin premios no entra en `W`.
5. **Solo para mostrar.** El sorteo de la compra (US-12004) elige con los pesos exactos: el mínimo de 0,01 muestra un premio muy chico por encima de su chance real.

## Alternativas descartadas
- **Redondear cada premio por separado** (lo que había): la suma puede no dar 100,00, que es lo que pide el CA2.
- **Mínimo descontado del primero de la lista:** dos premios casi empatados podían invertirse (con pesos 1000 / 999 / 0 / 1 y 97 legendarios, el común de 50,00 exacto quedaba en 49,51 y el raro de 49,95 en 49,52). Un oráculo con fracciones exactas lo encontró en 69 de 19 786 cofres al azar.
- **Sortear con los porcentajes redondeados:** cambiaría las chances reales que configuró el profesor.

## Consecuencias
- **Profesor y alumno ven lo mismo.** `ChestEvaluator` es único. Cambiaron dos valores que ya veía el profesor: tres épicos con los pesos por defecto pasan de 33,33 ×3 a 33,34 / 33,33 / 33,33, y un común de peso 1000 con 50 legendarios de peso 1 pasa de 99,90 a 99,50 (los 50 centésimos del mínimo salen del común).
- **Cable:** `probability` viaja con escala fija de 2 (`25.00`, nunca `25` ni `2.5E+1`), en el DTO del alumno (`dtos/chests/ChestStudentPrizeDto.java`).
- **Tests:** `ChestEvaluatorTest` (incluida una prueba con cofres al azar) y, de punta a punta, siete cofres de ejemplo en `ChestStudentAcceptanceTest` (US-12003 T04), leídos del texto JSON crudo.
- **US-12004:** el sorteo (#12017) tiene que repartir con los pesos, no con estos valores.

## Notas afectadas
[[Cofre]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[S3-03 - Cofres, el alumno ve los cofres del curso]], [[Decisiones - Índice]].
