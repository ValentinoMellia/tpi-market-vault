---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, decision, orden, estados]
---
# DEC-004 - Máquina de estados de la orden según el código

> La máquina de estados de la [[Orden de compra]] es la que define `OrderStatus` en el código. Las otras cuatro variantes de los documentos anteriores quedan descartadas.

## Contexto
Los documentos anteriores describían cinco máquinas distintas para la orden (estados en español, `PROVISIONING_ITEM` y `COMPENSATING`, `FUNDS_RESERVED` y `COMPENSATED_FAILED`, `PENDING_COMPENSATION`). El código tiene una sola. Pregunta de origen: [[Q-005 - Estados de la orden]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01: se adopta la máquina del código (`models/enums/OrderStatus.java`, transiciones forzadas por `OrderEntity.transitionTo` y `cancel`).

- Estados: `CREATED` (se informa como `PROCESSING` por HTTP), `HOLD_REQUESTED`, `HOLD_GRANTED`, `ITEM_PROVISION_REQUESTED`, `ITEM_PROVISIONED`, `CONFIRMED`, `REJECTED_INSUFFICIENT_FUNDS`, `CANCELLED`, `EXPIRED`.
- Terminales: `CONFIRMED`, `REJECTED_INSUFFICIENT_FUNDS`, `CANCELLED`, `EXPIRED`.

## Alternativas descartadas
- **Estados en español (`CREADA`...)**, **`PROVISIONING_ITEM` / `DEBIT_REQUESTED` / `COMPENSATING`**, **`FUNDS_RESERVED` / `ITEM_ACCREDITED` / `COMPENSATED_FAILED`** y **`PENDING_COMPENSATION`**: no existen en el código y exigirían refactor y reescritura de pruebas sin una necesidad concreta.

## Consecuencias
- La historia #143 deja de usar `PENDING_COMPENSATION` ([[Épica 137 - Compra directa]]).
- Esta decisión describe los estados **de hoy**. Si el orden de la saga cambia ([[Q-008 - Orden de la saga de compra]], sigue abierta) o Accounting reporta resultados nuevos ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[DEC-009 - Contrato de holds e ítems según Accounting]]), la máquina se ajustará con una decisión posterior; el mapeo de motivos de rechazo puede sumar estados o razones.

## Notas afectadas
[[Orden de compra]], [[Épica 137 - Compra directa]], [[Taller de decisiones]], [[Decisiones - Índice]].
