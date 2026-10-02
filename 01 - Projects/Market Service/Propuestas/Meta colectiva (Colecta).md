---
tipo: guia
estado: borrador
verificado_contra: equipo-propuestas@2026-09-30
actualizado: 2026-10-01
tags: [mercado, propuesta, colecta]
---
# Meta colectiva (Colecta)

> Propuesta: los estudiantes juntan monedas entre todos para conseguir un item que define el profesor. **No está aprobada por el PO** y no hay código.

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
