---
tipo: guia
estado: borrador
verificado_contra: equipo-mercado@2026-10-01
actualizado: 2026-10-01
tags: [mercado, propuesta, items, subastas]
---
# Ítems únicos

> Propuesta: ítems con habilidades especiales, pensados como lo que se subasta. **No está implementada ni aprobada**, y todavía no se sabe si se va a implementar.

## Qué se propone
Un concepto de ítem distinto de los cuatro tipos soportados hoy ([[Tipos de item]]): un ítem con **habilidades especiales**, que sería el objeto natural de una [[Subasta]]. El equipo de Mercado aclaró el 2026-10-01 que esto es una propuesta y no una decisión; por eso [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] dejó de afirmar que "se subastan ítems únicos".

## Qué no se sabe
- Qué habilidades tendrían y quién las define.
- Si "único" significa una sola unidad por subasta, un ítem exclusivo que no se vende en la tienda, o ambas cosas.
- Quién ejecuta los efectos: por [[DEC-010 - Los efectos de los ítems no son de Mercado]] Mercado no resuelve efectos; habría que acordarlo con Accounting y con el motor de desafíos.
- Cómo se crean, se otorgan y se registran: el inventario es de Accounting ([[DEC-001 - Accounting es dueño del inventario]]) y su catálogo hoy solo acepta `ITEM-PLACEHOLDER-1` a `3` ([[Integración con Accounting]]).
- Si encajan con el PRD (ver el conflicto análogo en [[Cofres y nuevos ítems]]).
- Si entran en el alcance del Sprint 3 o se difieren ([[Roadmap de trabajo]]).

## Impacto en las subastas
Mientras la propuesta no se apruebe, las subastas del Sprint 3 ofrecen ítems regulares del catálogo ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], que cerró [[Q-017 - Qué se subasta mientras no existan ítems únicos]]). El motor de subastas no depende del tipo de ítem, así que los únicos podrían sumarse luego como otro tipo subastable.

## Relacionado
[[Cofres y nuevos ítems]], [[Meta colectiva (Colecta)]], [[Épica 577 - Subastas]], [[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]].
