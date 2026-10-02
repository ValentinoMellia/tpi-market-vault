---
tipo: decision
estado: vigente
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, items, efectos]
---
# DEC-010 - Los efectos de los ítems no son de Mercado

> Mercado vende y configura ítems; no resuelve sus efectos. Los escudos los aplica Accounting y los multiplicadores los aplica el motor de desafíos.

## Contexto
Había posturas contradictorias sobre quién resuelve los efectos de un ítem cuando el estudiante resuelve un desafío: Mercado (`POST /inventory/resolve-effects`, historia #135), Mercado como enriquecedor de eventos ("Propuesta D") o el motor de desafíos. Pregunta de origen: [[Q-011 - Efectos y consumo de items]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01:

- **Escudos (`SHIELD`)**: los aplica Accounting al consumir el ítem reservado (libera el hold de vida con `SHIELD_APPLIED`).
- **Multiplicadores de XP y monedas**: los aplica el motor de desafíos.
- **Mercado solo vende y configura** el ítem (tipo, parámetros, precio) y publica `ITEM_CONFIRMED` con el `effect` derivado del tipo.

## Alternativas descartadas
- **Mercado resuelve los efectos**: amplía el alcance y duplica lógica que ya existe en Accounting y en el motor de desafíos.
- **"Propuesta D"** (Mercado enriquece eventos entre Challenges, Roadmap y Banco): ya estaba descartada ([[Ideas descartadas]]).

## Consecuencias
- No se construye resolución ni consumo de efectos en Mercado. La historia #135 se transfiere ([[Épica 131 - Inventario (otro equipo)]]).
- El vocabulario de efectos (D3: `ABSORB_FAILURE`, `XP_MULTIPLIER`, `COIN_MULTIPLIER`) se acuerda con Accounting y el motor de desafíos; sigue siendo una recomendación sin decidir ([[Taller de decisiones]]).
- Refuerza [[DEC-001 - Accounting es dueño del inventario]].

## Notas afectadas
[[Tipos de item]], [[Integración con Accounting]], [[Épica 131 - Inventario (otro equipo)]], [[Épica 482 - Boost XP (no es de Mercado)]], [[Market Service - Overview]], [[Ideas descartadas]], [[Taller de decisiones]], [[Decisiones - Índice]].
