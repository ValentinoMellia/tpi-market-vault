---
tipo: pregunta
estado: en-disputa
verificado_contra: DEC-015
actualizado: 2026-10-02
tags: [mercado, pregunta-abierta, backlog]
---
# Q-013 - Higiene del backlog

> El backlog de Taiga tiene duplicados, historias ajenas, faltantes y estados que no reflejan el código.

## Qué se contradice
| Problema | Detalle |
|---|---|
| Duplicadas | Las historias #130 y #810 son idénticas ("G11-HU06") con distinto responsable; US-810 duplica a US-130 |
| No es de Mercado | Épica #482 (Boost XP), cargada por error |
| A transferir | Épica #131 (ahora hacia Accounting, ver [[DEC-001 - Accounting es dueño del inventario]]) y las historias #786 a #788 |
| Faltantes | Plantillas, contrato de entrega del item (`ITEM_CONFIRMED`), `HOLD_REJECTED` en ofertas |
| Estados desactualizados | Solo US-092 y US-095 figuran como Done; siguen en New aunque el código implementa US-094, 096, 098, 945 y 946 (gestión de la tienda). Los estados de Taiga se mantienen a mano |
| Banners | EPIC-131 transferida, EPIC-482 mal cargada, EPIC-770 en división con el vencimiento descartado (recomendación T2) |
| Referencia dudosa | US-1036 "verificar matrícula" se cita como implementada contra un mock; su existencia en Taiga no está verificada |
| Desactualizadas | Eventos en español y endpoints viejos |

La nueva US #4888 corresponde a este trabajo del vault ([[Plan de migración]]).

## Qué hace hoy el código
No aplica. Ver [[Backlog - Índice]].

## Ya decidido
[[DEC-015 - Política del backlog de Taiga]] (2026-10-01):
- Las historias inconsistentes o desactualizadas que siguen abiertas se **cierran como obsoletas**, no se borran, para conservar la trazabilidad.
- Las historias nuevas siguen la plantilla US de la wiki del proyecto de Taiga (se leerá al reconfigurar el MCP de Taiga).
- Sprint 2: alinear el contrato con Accounting y las reglas de la tienda. Sprint 3: subastas y/o propuestas nuevas. Capacidad: 15 días, 340 h entre 10 integrantes (unas 34 h por persona por sprint). Ver [[Roadmap de trabajo]].

## Qué sigue pendiente
- Sanear realmente el backlog de Taiga (cerrar como obsoletas, transferir, crear faltantes, actualizar estados).
- Fechas de inicio y fin de los sprints.
- El alcance real del Sprint 2 en Taiga: historias anteriores, duplicadas o ya hechas dentro del sprint ([[Q-018 - Alcance real del Sprint 2 en Taiga]], [[Revisión del Sprint 2 en Taiga]]).
- Acceso al MCP de Taiga (lo debe reconfigurar el usuario; problema recurrente conocido).

## Opciones
1. **Sanear en Taiga** (cerrar como obsoletas, mover, crear faltantes, actualizar estados). Es la política decidida en [[DEC-015 - Política del backlog de Taiga]].
2. **Solo documentar acá.** Descartada.

## Recomendación
Opción 1. Ver [[Épica 482 - Boost XP (no es de Mercado)]] y [[Épica 131 - Inventario (otro equipo)]].

## Quién decide / con qué equipo hay que hablar
Equipo de Mercado y los equipos que reciben las transferencias (Accounting).

## Resolución
Parcial. Se registró [[DEC-015 - Política del backlog de Taiga]]. La pregunta **sigue abierta** hasta que el backlog de Taiga esté saneado y los sprints planificados.
