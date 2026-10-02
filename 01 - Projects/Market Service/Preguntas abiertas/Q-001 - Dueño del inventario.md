---
tipo: pregunta
estado: archivado
verificado_contra: DEC-001
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, inventario]
---
# Q-001 - Dueño del inventario

> ¿Quién es dueño del inventario (la mochila de items del estudiante)? **Resuelta**: Accounting (ex Banco), ver [[DEC-001 - Accounting es dueño del inventario]].

## Qué se contradecía
| Postura | Qué decía | Dónde aparecía |
|---|---|---|
| Banco incluye inventario | "Es el equipo de Banco, no un microservicio separado" | README anterior de Mercado |
| Dos servicios | Banco e Inventario como microservicios separados, con base propia | Documento de flujos |
| Grupo 12 = Banco | El Grupo 12 sería el equipo de Banco (no confundir con el Tema 12 Backoffice) | Contexto de Sprint 1 |
| Mercado dueño | La épica #131 modelaba ver, equipar y consumir items dentro de Mercado | Historias de Taiga |
| Mercado dueño de Subasta e Inventario | Los documentos de subastas asumían ambos | Documentos de subastas |
| Banco no administra inventario | Declaración del contrato de Banco, anterior a la lectura de su código | Contrato de Banco |
| Recomendación del taller | D13: Accounting es dueño de monedas e inventario ([[Taller de decisiones]]) | Taller de decisiones del equipo |

## Evidencia nueva
El repositorio de accounting (`develop`) tiene la tabla `inventory_items` y el flujo `ITEM_CONFIRMED` a `ITEM_CREDITED`. No existe un repositorio de inventario separado ([[Integración con Accounting]]).

## Qué hace hoy el código de Mercado
Sigue tratando el inventario como un servicio externo con tópicos propios: envía `ITEM_PROVISION_REQUESTED` a `inventory.items.commands` y espera `ITEM_PROVISIONED` o `ITEM_PROVISION_FAILED` (`clients/impl/OutboxInventoryItemProvisionClient.java`, `listeners/InventoryItemKafkaListener.java`). Esa parte debe alinearse a accounting ([[Roadmap de trabajo]]).

## Resolución
Cerrada el 2026-10-01 por decisión del usuario: el inventario es de Accounting. Ver [[DEC-001 - Accounting es dueño del inventario]]. Pregunta archivada; el seguimiento del contrato continúa en [[Q-007 - Contrato con Accounting]] y [[Q-008 - Orden de la saga de compra]].
