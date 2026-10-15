---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, hold, escrow]
---
# Hold y escrow

> Un hold reserva un monto sin gastarlo todavía; el escrow es mantener fondos en custodia hasta que se cumple una condición.

## El problema que resuelve
Hay que garantizar que el comprador tenga fondos durante una operación larga sin debitarlo antes de saber si salió bien.

## Cómo funciona
Se retiene el monto (el saldo disponible baja, el total no). Si la operación termina bien se confirma (débito real); si falla o vence se libera.

## Cómo lo usamos en Mercado
En la compra directa se retiene el precio (`HOLD_CREATED`), se acredita el ítem en Accounting (`ITEM_CREDITED`) y luego se confirma el débito del hold (`HOLD_CONFIRMED`), compensando ante fallos de cobro mediante revocación atómica ([[DEC-025 - Saga de compra de ítems según la Propuesta C]], cerrando [[Q-008 - Orden de la saga de compra]]). En subastas, la opción elegida por el equipo retiene cada oferta completa; retener solo al líder se descartó ([[Ideas descartadas]]). Ver [[Hold de monedas]] y [[Integración con Accounting]].

## Relacionado
[[Saga]], [[Subasta]], [[DEC-025 - Saga de compra de ítems según la Propuesta C]].
