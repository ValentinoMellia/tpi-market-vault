---
tipo: guia
estado: archivado
verificado_contra: equipo-propuestas@2026-09-30
actualizado: 2026-10-15
tags: [mercado, propuesta, colecta, archivo]
---
# Meta colectiva (Colecta)

> Propuesta anterior de Mercado, archivada: la reemplaza [[DEC-029 - Meta colectiva]], con el detalle en [[Meta colectiva]]. Se conserva como registro de lo que se propuso el 2026-09-30.

## Motivo del archivo
- El equipo la descartó el 2026-10-14 por desactualizada y sin verificar contra el código.
- Varias de sus afirmaciones sobre Accounting ya no son ciertas: Accounting sí vence los holds, sí los libera ante la baja de una cuenta y ya publica `ITEM_CONFIRMED` con `order_id` UUID.
- [[DEC-029 - Meta colectiva]] cambió reglas centrales:
  - Si la meta falla, por defecto se devuelve todo (la pérdida es opcional).
  - Puede dar un beneficio externo.
  - Usa el id de la meta como `order_id` para todos los holds.
  - Cobra en un solo paso atómico.
  - Agrega un comando para extender el vencimiento de los holds.

---

Contenido original de la propuesta:

## Idea en una línea
El profesor define un item, un monto objetivo y una fecha de cierre; los estudiantes aportan monedas. Si se alcanza la meta, todos los que aportaron reciben el item y se les cobra; si no, los aportantes pierden un porcentaje (`forfeitPercent`, por defecto 100) y nadie recibe el item.

## Reglas propuestas
| Tema | Propuesta |
|---|---|
| Parámetros | `minContribution`, `maxContributionPerStudent`, `minContributors` |
| Items permitidos | `SHIELD`, `BOOST_XP`, `BOOST_COINS` (sin `LIFE` y sin cofres) |
| Duración | De 1 hora a 14 días |
| Límite por curso | Máximo 3 metas abiertas |
| Si se cumple | Se cobra a todos los aportantes y se acredita el item a cada uno |
| Si no se cumple | Se cobra `forfeitPercent` y nadie recibe el item |

## Qué exige a Accounting
Requiere cambios en [[Integración con Accounting]], hoy inexistentes:

- Un nuevo `orderType` además de `DIRECT_PURCHASE` y `AUCTION_BID`.
- **Captura parcial** del hold (hoy no hay: se confirma o se libera completo).
- Acreditar el mismo item a N estudiantes.

Esta consulta está pendiente de respuesta de accounting.

## Puntos abiertos
Quedan siete puntos abiertos (M-1 a M-7) en el documento original de la propuesta; no se detallaron en el material ingerido. Hasta que se aclaren, no hay alcance cerrado.

## Estado
Borrador sin aprobación. Para avanzar hace falta el visto bueno del PO y la respuesta de Accounting. Ver [[Subasta]] por la similitud con el uso de holds y [[Hold de monedas]].
