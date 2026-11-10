---
tipo: decision
estado: vigente
verificado_contra: codigo@7ef0085ce
actualizado: 2026-11-10
tags: [mercado, decision, meta-colectiva, visibilidad]
---
# DEC-048 - Los alumnos ven a los aportantes de una meta

> Los alumnos de un curso ven quién aportó a una meta colectiva y cuánto, con su propio aporte marcado; nunca los identificadores de sus compañeros. Reemplaza, para los alumnos, la D16 de [[DEC-029 - Meta colectiva]]. La vista del profesor no cambia.

## Contexto
La D16 de [[DEC-029 - Meta colectiva]] dejaba al alumno con el total, el porcentaje, la cantidad de aportantes y su propio aporte, sin saber quién más aportó. El 2026-11-10 llegó el pedido (por Patricio, de parte de quien revisa la interfaz) de mostrar a todos los aportantes en las metas, con nombre y monto, para que la meta se viva como algo del curso.

No partió de una `Q`: es un pedido de producto sobre la interfaz.

## Decisión
- El alumno inscripto ve la lista de aportantes de una meta publicada: **nombre y monto confirmado**, del aporte más antiguo al más nuevo, con su propia fila marcada.
- Entran los mismos aportes que ve el profesor: `HELD`, `INCREASE_REQUESTED` o `CHARGED` con monedas confirmadas. Los aportes en vuelo o rechazados de otros alumnos no aparecen.
- El monto se muestra también en las metas de cuota fija (`FIXED`).
- No se exponen identificadores de alumnos, el estado del aporte ni la lista de quienes no aportaron.
- Si Cursos no responde, la lista sale igual, sin nombres.
- Contrato: `GET /api/market/courses/{courseId}/goals/{goalId}/contributors/summary`, con el permiso `market.goal.read` que el alumno ya tiene. La lista y el detalle de metas no cambian.

## Alternativas descartadas
- **Agregar la lista al detalle de la meta del alumno.** Cada lectura del detalle consultaría a Cursos por los nombres.
- **Abrir `/contributors` del profesor a los alumnos.** Obliga a bajar el permiso `market.goal-contributors.read` de un endpoint del profesor y a devolver dos formas distintas en la misma ruta.
- **Solo nombres, sin montos.** Patricio eligió nombre y monto.

## Consecuencias
- Los compañeros de curso ven cuánto aportó cada uno. Es intencional.
- La D16 de [[DEC-029 - Meta colectiva]] queda vigente solo para la vista del profesor; [[Meta colectiva]] describe la visibilidad nueva.
- El frontend muestra la lista en el detalle de la meta del alumno y la oculta si la consulta falla.
