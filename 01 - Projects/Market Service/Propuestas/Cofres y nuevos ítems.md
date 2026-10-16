---
tipo: guia
estado: borrador
verificado_contra: equipo-propuestas@2026-09-30
actualizado: 2026-10-16
tags: [mercado, propuesta, cofres, items]
---
# Cofres y nuevos ítems

> Propuesta: agregar una plantilla de cofre con premios al azar y nuevos tipos de item. **No está acordada** y entra en conflicto con requisitos del PRD.

## Cofres
Una plantilla `CHEST` con un conjunto de premios ponderados (peso por premio) y recompensas opcionales de monedas o XP. El sorteo se haría al crear la orden.

## Conflicto con el PRD
Contradice RF-INT-01 (las monedas solo se usan para vidas o equipamiento y nunca se obtienen por intercambio) y RF-INT-03. Por la jerarquía de verdad el PRD prevalece sobre una propuesta, así que los cofres con monedas no pueden avanzar sin una decisión explícita del PO.

Resuelto en [[DEC-031 - Cofres configurables con ítems, monedas y XP]], a partir de [[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]]: el PO aprobó cofres que pueden dar ítems, monedas o XP, configurados por el profesor. Para los cofres, RF-INT-01 deja de aplicarse. El resto de la propuesta (tipos de ítem nuevos y las decisiones D-1 a D-11) sigue sin acordar.

## Ideas de nuevos items
`HINT`, `AI_ASSIST`, `FIFTY_FIFTY`, `TEST_REVEAL`, `SOLUTION_UNLOCK`, `BONUS_CHALLENGE`, `STREAK_FREEZE`, `RECOVERY_REROLL`, `EXTRA_TIME`, `LATE_PASS`, `GOAL_INSURANCE`, `AUCTION_ALERT`, `COSMETIC`, `KUDOS`.

`STREAK_FREEZE` ya había aparecido y fue descartado como tipo ([[Ideas descartadas]]). Hoy los tipos soportados son solo cuatro ([[Tipos de item]]).

## Decisiones abiertas
Hay once decisiones abiertas (D-1 a D-11), por ejemplo si se permite un solo boost activo por tipo o si el PO acepta items cosméticos. Ninguna está acordada.

## Impacto
Cualquier tipo nuevo exige que accounting lo reconozca: hoy su catálogo acepta solo `ITEM-PLACEHOLDER-1` a `3` ([[Integración con Accounting]], recomendación D10 en [[Taller de decisiones]]) y no tiene lógica de efectos más allá de `SHIELD`.

Relacionada: [[Plantilla base]], [[Meta colectiva]].
