---
tipo: pregunta
estado: archivado
verificado_contra: equipo-mercado@2026-10-01
actualizado: 2026-10-01
tags: [mercado, pregunta-archivada, subastas, sprint-3]
---
# Q-017 - Qué se subasta mientras no existan ítems únicos

> Las subastas están previstas para el Sprint 3, pero el único concepto de ítem subastable es la propuesta no aprobada [[Ítems únicos]]. Hay que definir qué se subasta, o si se posponen las subastas.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Plan | Subastas en el Sprint 3 | [[Roadmap de trabajo]], [[DEC-015 - Política del backlog de Taiga]] |
| Dependencia | Lo subastable sería un ítem único, hoy solo una propuesta sin implementar ni aprobar | [[Ítems únicos]], [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] (enmendada) |

Origen: [[Q-012 - Alcance de subastas]] (archivada); las reglas de la subasta están decididas en [[DEC-014 - Reglas de subastas]].

## Qué hace hoy el código
Nada: no hay subastas ([[Subasta]]). Los tipos de ítem soportados son cuatro ([[Tipos de item]]).

## Opciones
1. **(a) Subastar ítems regulares del catálogo hasta que existan los únicos**, con ofertas basadas en plantillas y una sola unidad.
   - A favor: es la única opción que no bloquea el Sprint 3; reutiliza [[Oferta de catálogo]] y [[Plantilla base]].
   - En contra: puede chocar con el concepto de "único" que el equipo tiene en mente; hay que definir la referencia del ítem (`itemTemplateId` o `catalogOfferId`) y si S4 (solo equipamiento) aplica ([[Taller de decisiones]]); riesgo de rehacer parte al llegar los únicos.
2. **(b) Posponer las subastas hasta que se aprueben los ítems únicos.**
   - A favor: evita construir sobre un concepto provisional.
   - En contra: el Sprint 3 pierde su alcance principal y las subastas no tienen fecha, porque la propuesta ni siquiera está aprobada.
3. **(c) Aprobar y construir los ítems únicos dentro del Sprint 3.**
   - A favor: entrega subastas con el concepto completo.
   - En contra: exige aprobar la propuesta, acordar efectos y catálogo con Accounting ([[DEC-010 - Los efectos de los ítems no son de Mercado]], [[Integración con Accounting]]) y sumar trabajo a un sprint con capacidad fija (340 h); alto riesgo de no llegar.

## Recomendación
Se eligió la opción (a).

## Quién decide / con qué equipo hay que hablar
Equipo de Mercado (líder y Product Owner); Accounting si se eligen los ítems únicos.

## Resolución
Archivada el 2026-10-01. Resuelta por [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]: opción (a), subastar ítems regulares del catálogo hasta que existan los únicos.
