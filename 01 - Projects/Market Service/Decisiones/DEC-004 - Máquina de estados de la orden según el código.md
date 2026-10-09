---
tipo: decision
estado: vigente
verificado_contra: codigo@f7457882
actualizado: 2026-10-09
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

## Estado de implementación (2026-10-09)
Nota de seguimiento, verificada contra `develop` en `f7457882` (PR #110, US-5193 T07); no contradice la decisión sino que concreta la evolución prevista en Consecuencias:
- La máquina de estados incorporó el estado terminal `REJECTED` (`models/enums/OrderStatus.java`), con transición válida `HOLD_REQUESTED -> REJECTED`.
- La transición se encapsula en `OrderEntity.reject(OrderRejectionReason)`, que persiste la causa tipada en `rejectionReason`. La llamada directa `transitionTo(REJECTED)` lanza `IllegalArgumentException` al igual que con `CANCELLED`.
- Se mapearon los 10 motivos contractuales de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]]): `INSUFFICIENT_BALANCE` / `INSUFFICIENT_FUNDS` transiciona a `REJECTED_INSUFFICIENT_FUNDS`, y los otros nueve pasan a `REJECTED`.

## Notas afectadas
[[Orden de compra]], [[Épica 137 - Compra directa]], [[Taller de decisiones]], [[Decisiones - Índice]].
