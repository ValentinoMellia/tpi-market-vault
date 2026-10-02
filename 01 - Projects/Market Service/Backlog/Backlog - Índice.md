---
tipo: indice
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-02
tags: [mercado, backlog]
---
# Backlog - Índice

> Las épicas de Taiga de Mercado, saneadas y con su estado real en el código. No hay una nota por historia: cada épica lista las suyas en una tabla.

## Épicas

| Épica | Alcance | Estado general |
|---|---|---|
| [[Épica 090 - Catálogo por plantillas]] | Sprint 1 | Casi completa en el código |
| [[Épica 137 - Compra directa]] | Sprint 1 | Parcial; falta alinear el contrato con Accounting y manejar el resultado del tope de vidas que reporte Accounting |
| [[Épica 577 - Subastas]] | Fase 3 (Sprint 3 previsto) | No iniciada; qué se subasta definido ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]); cierre decidido ([[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]]) y reglas en [[DEC-014 - Reglas de subastas]] |
| [[Épica 770 - Vencimiento de items]] | Descartada | Sin vencimiento de ítems ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]); historias a cerrar en Taiga |
| [[Épica 131 - Inventario (otro equipo)]] | Transferida a Accounting | No es de Mercado ([[DEC-001 - Accounting es dueño del inventario]]) |
| [[Épica 482 - Boost XP (no es de Mercado)]] | Fuera de alcance | Duplicadas y ajena |

## Leyenda de estado

`implementada`, `parcial`, `no iniciada`, `transferir` (pertenece a otro equipo) y `duplicada`. El estado de esta tabla es el del código en `codigo@7528610`.

## Estados en Taiga

Los estados de Taiga se mantienen a mano y están desactualizados: solo US-092 y US-095 figuran como Done; el resto sigue en New, aunque el código implementa US-094, 096, 098, 945 y 946 (gestión de la tienda). Banners vigentes en Taiga: EPIC-131 transferida (ahora a accounting), EPIC-482 mal cargada, EPIC-770 en división con el vencimiento descartado (T2, decidido en [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]; las historias #778 y #785 a #788 se cierran o quitan) y US-810 duplicada de US-130. Existe además la US #4888, que corresponde al trabajo de este vault ([[Plan de migración]]).

## Política del backlog

[[DEC-015 - Política del backlog de Taiga]] (2026-10-01):
- Las historias inconsistentes o desactualizadas que siguen abiertas se **cierran como obsoletas**, no se borran, para conservar la trazabilidad.
- Las historias nuevas siguen la plantilla US de la wiki del proyecto de Taiga (se leerá al reconfigurar el MCP de Taiga).
- Sprint 2: contrato con Accounting y reglas de la tienda. Sprint 3: subastas y/o propuestas nuevas ([[Roadmap de trabajo]]).

## Problemas del backlog

Duplicados, historias ajenas y faltantes se registran en [[Q-013 - Higiene del backlog]], que sigue abierta hasta sanear el backlog de Taiga. Contexto del proyecto: [[Market Service - Overview]] y [[Roadmap de trabajo]]. Las operaciones exactas para cargar y cerrar historias están en [[Carga en Taiga - Sprints 2 y 3]]. Las historias del Sprint 2, una nota por historia con su plantilla y tareas: [[Sprint 2 - Índice]]. Cómo quedó el sprint en Taiga y qué historias se solapan: [[Revisión del Sprint 2 en Taiga]].
