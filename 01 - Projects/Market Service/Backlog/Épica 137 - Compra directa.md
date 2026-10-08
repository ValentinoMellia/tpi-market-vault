---
tipo: historia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-04
tags: [mercado, backlog, epica]
taiga: "#137"
epica: "Compra directa"
---
# Épica 137 - Compra directa

> El estudiante compra un item con monedas; Mercado coordina cobro y entrega sin cobrar dos veces ni dejar compras a medias.

## Objetivo
Implementar la [[Orden de compra]] con [[Saga]], [[Hold de monedas]] e [[Idempotencia]]. Alcance del Sprint 1.

## Historias
| Taiga # | Título | Estado en el código |
|---|---|---|
| #138 | Comprar un item (8 pts) | parcial (flujo completo con clientes simulados de Cursos; Accounting (ex Banco) real solo con `kafka`, y con un contrato que todavía no coincide con el de accounting) |
| #139 | No pagar dos veces (doble clic) | parcial (clave de idempotencia y huella implementadas) |
| #140 | Ver el resultado de una compra en proceso | parcial (SSE envía un solo evento) |
| #141 | Recuperar monedas si la compra no se completó | parcial (libera el hold ante fallo) |
| #142 | Comprar una vida sin pasarse del tope | cubierta por [[S2-11 - Acuerdos de compra de vidas con Accounting]] (#6268): Mercado valida el tope antes del hold y Accounting recorta al acreditar ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]) |
| #143 | Revisar compras a medias | parcial (reconciliación apagada hasta que Accounting integre la consulta de hold; ver [[DEC-009 - Contrato de holds e ítems según Accounting]]) |

## Notas
- Para que la compra funcione de punta a punta hay que alinear el contrato con Accounting (tópicos, `ITEM_CONFIRMED` y `ITEM_CREDITED`, `orderId` UUID): [[Integración con Accounting]] y [[Roadmap de trabajo]].
- Todas las historias siguen en New en Taiga aunque el código las implementa parcialmente ([[Q-013 - Higiene del backlog]]).
- La historia #143 usa un estado `PENDING_COMPENSATION` que el código no tiene y que se descarta ([[DEC-004 - Máquina de estados de la orden según el código]]); hay que ajustar la historia.
- Orden de la saga: [[Q-008 - Orden de la saga de compra]].
