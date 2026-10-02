---
tipo: integracion
estado: archivado
verificado_contra: DEC-001
actualizado: 2026-10-01
tags: [mercado, archivo, inventario, accounting]
---
# Integración con Inventario (archivada)

> Nota fusionada en [[Integración con Accounting]]. No existe un servicio de inventario separado.

## Motivo del archivo
[[DEC-001 - Accounting es dueño del inventario]] establece que el inventario pertenece a Accounting (ex Banco). Los tópicos `inventory.items.commands` e `inventory.items.events` y los mensajes `ITEM_PROVISION_REQUESTED`, `ITEM_PROVISIONED` e `ITEM_PROVISION_FAILED` fueron propuestas de diseño que nunca se aprovisionaron en la plataforma; hoy solo existen en el código de Mercado ([[Estado actual del código]]). El mecanismo real es `ITEM_CONFIRMED` hacia accounting y `ITEM_CREDITED` de vuelta.

Ver [[Ideas descartadas]].
