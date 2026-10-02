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
Compra directa: se crea la orden, se pide el hold, se entrega el item y recién entonces se confirma el débito; ante fallos se libera el hold y el stock. Ese es el orden del código de Mercado; Accounting hace el inverso y el taller recomienda un tercero, así que el orden sigue abierto. Ver [[Orden de compra]], [[Hold de monedas]] y [[Q-008 - Orden de la saga de compra]]. Código en `services/impl/PurchaseOrderServiceImpl.java`.

## Relacionado
[[Patrón Outbox]], [[Idempotencia]], [[Hold y escrow]], [[Épica 137 - Compra directa]].
