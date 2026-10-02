---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, backlog, taiga, sprint]
---
# DEC-015 - Política del backlog de Taiga

> Las historias inconsistentes u obsoletas se cierran como obsoletas (no se borran), las historias nuevas siguen la plantilla US de la wiki de Taiga, y el Sprint 2 y el Sprint 3 tienen alcance y capacidad definidos. **No cierra** [[Q-013 - Higiene del backlog]].

## Contexto
El backlog de Taiga tiene duplicados, historias ajenas, faltantes y estados desactualizados ([[Q-013 - Higiene del backlog]]), y hay que planificar los sprints 2 y 3. Pregunta de origen: [[Q-013 - Higiene del backlog]].

## Decisión
Confirmada por el equipo de Mercado el 2026-10-01.

**Política de historias**
- Las historias inconsistentes o desactualizadas que siguen abiertas se **cierran como obsoletas**; **no se borran**, para conservar la trazabilidad.
- Las historias de usuario nuevas siguen la **plantilla US de la wiki del proyecto de Taiga**. Se leerá cuando se reconfigure el MCP de Taiga.

**Alcance de los sprints**
- **Sprint 2**: alinear el contrato con Accounting (P0 del [[Roadmap de trabajo]], [[DEC-009 - Contrato de holds e ítems según Accounting]]) y las reglas de la tienda ([[DEC-013 - Reglas de la tienda]]).
- **Sprint 3**: subastas ([[DEC-014 - Reglas de subastas]]) y/o propuestas nuevas ([[Meta colectiva (Colecta)]], [[Cofres y nuevos ítems]]).

**Capacidad**
- Cada sprint dura **15 días**, con **340 h** entre **10 integrantes** (unas 34 h por persona por sprint). Igual para el Sprint 3.

**Pendiente**
- ~~Fechas de inicio y fin de cada sprint.~~ Definidas el 2026-10-01: Sprint 2 del 2026-09-28 al 2026-10-11; Sprint 3 del 2026-10-12 al 2026-10-25.
- Acceso al MCP de Taiga: lo debe reconfigurar el usuario (problema recurrente conocido).

## Alternativas descartadas
- **Borrar las historias obsoletas**: se pierde la trazabilidad.
- **Solo documentar el problema en el vault**: no sanea Taiga, que es la herramienta de planificación.

## Consecuencias
- [[Q-013 - Higiene del backlog]] **sigue abierta** hasta que el backlog de Taiga esté realmente saneado y los sprints planificados.
- Las historias de la épica #770 (#778, #785 a #788), la épica #482 y los duplicados (US-810) se cierran como obsoletas, no se borran ([[Backlog - Índice]]).
- [[Roadmap de trabajo]] incorpora la sección "Sprint 2 y Sprint 3".
- Hasta reconfigurar el MCP de Taiga no se pueden leer la plantilla US ni crear historias.

## Notas afectadas
[[Q-013 - Higiene del backlog]], [[Backlog - Índice]], [[Roadmap de trabajo]], [[Decisiones - Índice]].
