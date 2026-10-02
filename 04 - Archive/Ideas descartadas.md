---
tipo: guia
estado: archivado
verificado_contra: DEC-001
actualizado: 2026-10-01
tags: [mercado, archivo]
---
# Ideas descartadas

> Ideas que aparecieron en la documentación anterior y fueron descartadas o superadas, con el motivo.

| Idea | Qué era | Por qué se descartó |
|---|---|---|
| Propuesta D | Mercado como enriquecedor de eventos entre Challenges, Roadmap y Banco | Mercado no procesa eventos de desafíos ([[DEC-010 - Los efectos de los ítems no son de Mercado]]) |
| Catálogo fijo de 15 consumibles | Quince items con niveles del 1 al 5 | Se reemplazó por plantillas configurables ([[Plantilla base]]) |
| Escrow opción 2 | Retener monedas solo del líder de la subasta | Se eligió retener cada oferta completa ([[Hold y escrow]], [[Subasta]]) |
| Inventario dentro de Mercado | Saldo simulado e inventario propios | El inventario es de Accounting ([[DEC-001 - Accounting es dueño del inventario]]) |
| Servicio de inventario separado | Un microservicio de inventario con base propia y tópicos `inventory.items.*` | No existe repositorio ni equipo; Accounting guarda `inventory_items` ([[DEC-001 - Accounting es dueño del inventario]]). Nota archivada: [[Integración con Inventario (archivada)]] |
| Grupo 12 como dueño del inventario | El "Grupo 12" sería el equipo de Banco o el de inventario | Confusión con el Tema 12 (Backoffice); sin evidencia. El dueño es Accounting ([[DEC-001 - Accounting es dueño del inventario]]) |
| `PURCHASE_SETTLEMENT_REQUESTED` | Contrato de un solo comando para liquidar la compra (v2.0, 26/09) | Ningún lado lo implementó; Accounting usa `HOLD_CONFIRM_REQUESTED` más `ITEM_CONFIRMED` ([[Q-008 - Orden de la saga de compra]]) |
| Tópicos `bank.holds.*`, `inventory.items.*`, `market.auctions.events`, `notifications.alerts` | Nombres propuestos en el diseño | Nunca se aprovisionaron; la plataforma usa un tópico `<dominio>.events` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]) |
| Nota de integración con Banco | Describía el contrato con "Banco" | Renombrado a Accounting; archivada en [[Integración con Banco (archivada)]] |
| Reserva y confirmación síncronas | Una sola petición reservaba y confirmaba (Sprint 0) | Se reemplazó por la [[Saga]] asíncrona |
| Subastas en Fase 2 | Planificadas antes | Corregido a Fase 3 ([[Épica 577 - Subastas]]) |
| "Nunca hay stock" | Ofertas sin stock | Superada por el stock opcional del 19/09, confirmado en [[DEC-002 - Stock opcional por oferta]] |
| Vencimiento de ítems del inventario | Fecha fija o 1 a 180 días desde la recepción, con aviso a 24 horas | Ningún servicio lo implementa y se decidió que los ítems no vencen ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]) |
| Mercado valida el tope de vidas antes del hold | Error 422 `MAX_LIVES_REACHED` previo al hold (historia #142) | Accounting decide y reporta el tope; Mercado reacciona ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]) |
| Holds por REST síncrono | Pedir holds por el gateway | Accounting no lo ofrece; solo Kafka ([[DEC-003 - Holds solo por Kafka]]) |
| Otras cuatro máquinas de estados de la orden | `CREADA`, `PROVISIONING_ITEM` y `COMPENSATING`, `FUNDS_RESERVED`, `PENDING_COMPENSATION` | Se adopta la del código ([[DEC-004 - Máquina de estados de la orden según el código]]) |
| Cancelación de subastas por estudiantes | Que el postor o el vendedor estudiante cancele | Solo vence el tiempo o cancela un profesor ([[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]]) |
| `STREAK_FREEZE` | Tipo de item en algunos documentos | No está en el código ni en el conjunto cerrado de [[Tipos de item]]; reaparece como idea en [[Cofres y nuevos ítems]] |
