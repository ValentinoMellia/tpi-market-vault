---
tipo: historia
estado: vigente
verificado_contra: DEC-001
actualizado: 2026-10-01
tags: [mercado, backlog, epica, inventario]
taiga: "#131"
epica: "Inventario, equipamiento y consumo"
---
# Épica 131 - Inventario (otro equipo)

> Ver, equipar y consumir items. Pertenece a Accounting (ex Banco), que es dueño del inventario según [[DEC-001 - Accounting es dueño del inventario]]; Taiga todavía la tiene en Mercado.

## Objetivo
Transferir la épica a Accounting. Accounting ya tiene inventario por unidad, equipar y desequipar (pedido por Roadmap), reserva y consumo de items; ver [[Integración con Accounting]].

## Historias
| Taiga # | Título | Estado en el código |
|---|---|---|
| #132 | Ver mi inventario | transferir (accounting expone `GET /me/items`) |
| #133 | Equipar y desequipar | transferir (`ITEM_EQUIP_REQUESTED` e `ITEM_UNEQUIP_REQUESTED`) |
| #134 | Activar un consumible temporal | transferir |
| #135 | Aplicar protección automática | transferir (accounting aplica `SHIELD`; ver [[DEC-010 - Los efectos de los ítems no son de Mercado]]) |
| #136 | Recibir un item sin comprarlo (Won't) | transferir |

## Notas
Mercado no tiene entidad de inventario ni la tendrá. Las reglas de dominio previstas (un item equipado por verbo de efecto, consumibles activados, escudos que se consumen al fallar) están en [[Tipos de item]]. El banner de la épica en Taiga indica que fue transferida a Accounting ([[Q-013 - Higiene del backlog]]).
