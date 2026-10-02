---
tipo: historia
estado: archivado
verificado_contra: DEC-012
actualizado: 2026-10-01
tags: [mercado, backlog, epica, vencimiento]
taiga: "#770"
epica: "Vencimiento"
---
# Épica 770 - Vencimiento de items

> Que los items comprados pudieran vencer. **Descartada** el 2026-10-01: los ítems no vencen ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]). Las historias sobre vencimiento de ítems se cierran o se quitan en Taiga.

## Objetivo
Era el vencimiento de ítems del inventario. Ver [[Vencimiento de items]] y [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] (pregunta de origen: [[Q-014 - Vencimiento de items]], archivada).

## Historias
| Taiga # | Título | Acción |
|---|---|---|
| #778 | Configurar el vencimiento en la oferta | cerrar o quitar (se retira `itemValidityDays`); si la historia cubre el vencimiento de la publicación de la oferta, conservar esa parte |
| #785 | Ver cuándo vencen mis items | cerrar o quitar |
| #786 | Aviso 24 horas antes | cerrar o quitar |
| #787 | Vencer automáticamente | cerrar o quitar |
| #788 | Consultar items vencidos | cerrar o quitar |

## Notas
- Las historias #786 a #788 ya no se transfieren a Accounting ([[Épica 131 - Inventario (otro equipo)]]): se descartan.
- Lo que sí existe es el vencimiento de la publicación de la oferta (`publicationExpiresAt`, [[Oferta de catálogo]]); cualquier historia sobre eso se conserva.
- La limpieza en Taiga se coordina en [[Q-013 - Higiene del backlog]] y es una tarea de [[Roadmap de trabajo]].
