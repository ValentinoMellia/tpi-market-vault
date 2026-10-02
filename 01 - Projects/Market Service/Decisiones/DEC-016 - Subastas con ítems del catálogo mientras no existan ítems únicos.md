---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, subastas, sprint-3]
---
# DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos

> En el Sprint 3 las subastas ponen en venta ítems regulares del catálogo, de a una unidad, sin esperar a los ítems únicos. El motor de subastas no depende del tipo de ítem, para poder sumar los únicos más adelante si la propuesta se aprueba.

## Contexto
Las subastas están previstas para el Sprint 3 ([[DEC-015 - Política del backlog de Taiga]], [[Roadmap de trabajo]]), pero el único concepto de ítem subastable era la propuesta no aprobada [[Ítems únicos]]. Pregunta de origen: [[Q-017 - Qué se subasta mientras no existan ítems únicos]] (archivada). Las reglas de la subasta ya están en [[DEC-014 - Reglas de subastas]].

## Decisión
Confirmada por el equipo de Mercado el 2026-10-01.
- Mientras no existan ítems únicos, una subasta ofrece **una unidad de una oferta basada en una plantilla** ([[Oferta de catálogo]], [[Plantilla base]]).
- Si la subasta referencia la plantilla o la oferta, el ítem se **congela (snapshot) al lanzar la subasta**, como indica S9 del [[Taller de decisiones]].
- El **motor de subastas no depende del tipo de ítem**: trata lo subastable como una referencia abstracta, de modo que los ítems únicos puedan agregarse luego como otro tipo subastable si la propuesta [[Ítems únicos]] se aprueba.

## Alternativas descartadas
- **Posponer las subastas hasta aprobar los ítems únicos**: el Sprint 3 perdería su alcance principal y no hay fecha, porque la propuesta ni siquiera está aprobada.
- **Aprobar y construir los ítems únicos dentro del Sprint 3**: exige acordar efectos y catálogo con Accounting ([[DEC-010 - Los efectos de los ítems no son de Mercado]], [[Integración con Accounting]]) y suma trabajo a un sprint de capacidad fija (340 h); riesgo alto de no llegar.

## Consecuencias
- El Sprint 3 **no queda bloqueado** por los ítems únicos.
- S4 (subastar solo equipamiento, sin vidas) sigue como recomendación sin decidir; las vidas quedan excluidas salvo que se decida otra cosa ([[Taller de decisiones]]).
- Si los ítems únicos se aprueban, habrá que agregar su tipo subastable sin rehacer el motor.
- La referencia concreta del ítem (`itemTemplateId` o `catalogOfferId`) se define al diseñar la historia de lanzar subasta ([[Épica 577 - Subastas]]).

## Notas afectadas
[[Q-017 - Qué se subasta mientras no existan ítems únicos]], [[Ítems únicos]], [[Subasta]], [[Épica 577 - Subastas]], [[Roadmap de trabajo]], [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]], [[DEC-014 - Reglas de subastas]], [[Taller de decisiones]], [[Decisiones - Índice]].
