---
tipo: guia
estado: borrador
verificado_contra: equipo-propuestas@2026-09-30
actualizado: 2026-10-17
tags: [mercado, propuesta, cofres, items]
---
# Cofres y nuevos ítems

> Propuesta original de cofres con premios al azar y de nuevos tipos de ítem. Los cofres ya están decididos y se construyen en dos fases ([[DEC-035 - Cofres en dos fases]]); los tipos de ítem nuevos siguen sin acordar.

## Cofres
Una plantilla `CHEST` con un conjunto de premios ponderados (peso por premio) y recompensas opcionales de monedas o XP. El sorteo se haría al crear la orden.

## Conflicto con el PRD
Contradice RF-INT-01 (las monedas solo se usan para vidas o equipamiento y nunca se obtienen por intercambio) y RF-INT-03. Por la jerarquía de verdad el PRD prevalece sobre una propuesta, así que los cofres con monedas no pueden avanzar sin una decisión explícita del PO.

Resuelto en [[DEC-031 - Cofres configurables con ítems, monedas y XP]], a partir de [[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]]: el PO aprobó cofres que pueden dar ítems, monedas o XP, configurados por el profesor. Para los cofres, RF-INT-01 deja de aplicarse. El sorteo y las reglas de configuración están en [[DEC-032 - Sorteo y reglas de configuración de los cofres]]. La acreditación quedó acordada en [[DEC-034 - Acreditación de premios de cofre en Accounting]] (monedas, equipamiento y vidas) y [[DEC-033 - Acreditación de XP de cofre en Roadmap]] (XP). Los tipos de ítem nuevos siguen sin acordar.

La task T03 #8428 cerró el alcance en [[DEC-035 - Cofres en dos fases]]: primero cofres con premios de ítem (equipamiento y vidas) y después monedas y XP, cuando Accounting y Roadmap tengan su parte. Las historias técnicas están listadas en esa decisión y se cargan en Taiga en la próxima planning.

## Ideas de nuevos items
`HINT`, `AI_ASSIST`, `FIFTY_FIFTY`, `TEST_REVEAL`, `SOLUTION_UNLOCK`, `BONUS_CHALLENGE`, `STREAK_FREEZE`, `RECOVERY_REROLL`, `EXTRA_TIME`, `LATE_PASS`, `GOAL_INSURANCE`, `AUCTION_ALERT`, `COSMETIC`, `KUDOS`.

`STREAK_FREEZE` ya había aparecido y fue descartado como tipo ([[Ideas descartadas]]). Hoy los tipos soportados son solo cuatro ([[Tipos de item]]).

## Decisiones abiertas
Hay once decisiones abiertas (D-1 a D-11), por ejemplo si se permite un solo boost activo por tipo o si el PO acepta items cosméticos. La tabla no se había migrado al vault. Se recuperó de la propuesta original (30/09) y se revisó el 2026-10-16 en [[DEC-032 - Sorteo y reglas de configuración de los cofres]]: D-1 a D-4 son de cofres y quedan resueltas o sin efecto; D-5, D-6, D-7, D-9 y D-10 son de la meta colectiva ([[DEC-029 - Meta colectiva]]); D-8 (un solo boost activo por tipo) es de efectos de ítems, y D-11 (cosméticos), de la US-8401.

## Impacto
Cualquier tipo nuevo exige que accounting lo reconozca. Desde su HU58, Accounting toma las cargas y el ámbito del ítem del mensaje y no de su catálogo de `ITEM-PLACEHOLDER-1` a `3` ([[Integración con Accounting]], recomendación D10 en [[Taller de decisiones]]), pero no tiene lógica de efectos más allá de `SHIELD`. Su migración V4 ya menciona `LOOT_CHEST`, sin código que lo use ([[Q-028 - Acreditación de premios de cofre en Accounting]]).

Relacionada: [[Plantilla base]], [[Meta colectiva]].
