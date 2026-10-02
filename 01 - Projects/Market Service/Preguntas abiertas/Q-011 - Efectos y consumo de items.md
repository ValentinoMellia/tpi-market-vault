---
tipo: pregunta
estado: archivado
verificado_contra: DEC-010
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, items]
---
# Q-011 - Efectos y consumo de items

> ¿Quién resuelve los efectos de un item (escudo, boost) cuando el estudiante resuelve un desafío? La evidencia muestra que no es Mercado: reparten el trabajo Accounting y el motor de desafíos. **Resuelta**: ver [[DEC-010 - Los efectos de los ítems no son de Mercado]].

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Mercado no procesa | Mercado no procesa `DESAFIO_RESUELTO`; `ITEM_CONSUMED` se quitó | Contexto de Sprint 1 |
| Mercado resuelve | `POST /inventory/resolve-effects` en Mercado | Historia #135 |
| Mercado enriquece eventos | "Propuesta D" ([[Ideas descartadas]]) | Propuesta anterior |
| Motor de Desafíos | Envía `consumedItemIds` a Accounting (ex Banco) | Diseño de Transacciones de accounting |

## Evidencia nueva (código de accounting)
- El motor de desafíos publica `CHALLENGE_COMPLETED` y `CHALLENGE_ABORTED` en `challenges.events`.
- Accounting consume los items reservados y aplica `SHIELD` (libera el hold de vida con `SHIELD_APPLIED`). Los multiplicadores de XP y monedas los hace el motor de desafíos. No hay lógica de `BOOST` ni de `LIFE` en accounting.
- `item_effect` es texto libre en `inventory_items`.
Detalle en [[Integración con Accounting]].

## Recomendación del taller del equipo
D3: vocabulario de efectos `ABSORB_FAILURE`, `XP_MULTIPLIER` y `COIN_MULTIPLIER` ([[Tipos de item]], [[Taller de decisiones]]).

## Qué hace hoy el código
Nada en Mercado: no hay resolución de efectos ni consumo. El `effect` de `ITEM_CONFIRMED` se deriva del tipo de item (commit `e208109`).

## Opciones
1. **No es de Mercado**: la consume Accounting (inventario, escudos) y el motor de desafíos (multiplicadores).
2. **Mercado lo resuelve.** Amplía el alcance.

## Recomendación
Opción 1, reforzada por [[DEC-001 - Accounting es dueño del inventario]]. Queda por acordar el vocabulario de efectos (D3).

## Quién decide / con qué equipo hay que hablar
Accounting y el motor de desafíos.

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: los escudos los aplica Accounting, los multiplicadores el motor de desafíos y Mercado solo vende y configura. Ver [[DEC-010 - Los efectos de los ítems no son de Mercado]]. El vocabulario de efectos (D3) sigue como recomendación sin decidir. Pregunta archivada.
