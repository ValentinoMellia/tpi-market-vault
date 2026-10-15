---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, saga]
---
# Saga

> Forma de completar una operación que atraviesa varios servicios mediante pasos locales y compensaciones, sin una transacción global.

## El problema que resuelve
Una compra toca servicios con bases distintas (Mercado y Accounting, que guarda monedas e inventario). No se puede hacer un commit único entre todos. Si un paso falla a mitad de camino, hay que deshacer lo hecho.

## Cómo funciona
Se divide la operación en pasos, cada uno con su transacción local. Cada paso emite un mensaje que dispara el siguiente. Si uno falla, se ejecutan acciones compensatorias (por ejemplo, liberar una retención). Mercado usa coreografía por mensajes con una máquina de estados que registra el avance.

## Cómo lo usamos en Mercado
Compra directa: en compras de ítems del catálogo se adopta la [[Propuesta C de la saga de compra]] formalizada en [[DEC-025 - Saga de compra de ítems según la Propuesta C]] (cerrando [[Q-008 - Orden de la saga de compra]]). El flujo crea la orden, solicita el hold (`HOLD_CREATED`), emite `ITEM_CONFIRMED` pasando a `ITEM_PROVISION_REQUESTED`, espera la acreditación por Accounting (`ITEM_CREDITED`), avanza a `ITEM_PROVISIONED`, confirma el débito del hold (`HOLD_CONFIRM_REQUESTED` y `HOLD_CONFIRMED`) y finaliza en `CONFIRMED`. Ante fallas de confirmación o vencimiento del deadline, se ejecuta compensación atómica emitiendo `ITEM_REVOKE_REQUESTED`. Ver [[Orden de compra]], [[Hold de monedas]] y [[Integración con Accounting]]. Código en `services/impl/PurchaseOrderServiceImpl.java`.

## Relacionado
[[Patrón Outbox]], [[Idempotencia]], [[Hold y escrow]], [[Épica 137 - Compra directa]], [[DEC-025 - Saga de compra de ítems según la Propuesta C]].
