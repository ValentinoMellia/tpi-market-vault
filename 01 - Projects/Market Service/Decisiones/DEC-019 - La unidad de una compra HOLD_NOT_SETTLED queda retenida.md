---
tipo: decision
estado: vigente
verificado_contra: codigo@f7457882
actualizado: 2026-10-06
tags: [mercado, decision, compra, stock, hold]
---
# DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida

> Cuando una compra termina en `CANCELLED` con `HOLD_NOT_SETTLED` (el estudiante recibió el ítem y no se le cobró), su unidad **no** vuelve al stock de la oferta: queda retenida, sin contar como disponible ni como vendida. Una unidad cuenta como usada cuando se entrega, no cuando se cobra.

## Contexto
`HOLD_NOT_SETTLED` pasa cuando Inventory ya entregó el ítem (`ITEM_PROVISIONED`) y después falla la confirmación del cobro porque el hold de Accounting se liberó o venció. La T01 #5220 de [[S2-05 - Robustez de la compra]] y [[S2-OPC1 - Reconciliación de compras]] pedían devolver esa unidad al stock, a partir del gap 19 de [[Estado actual del código]], que estaba reportado sin verificar. Al verificarlo resultó que el código la retiene a propósito desde la US-138 T05 (decisión CD12 de su diseño) y que el PR #113 de `tpi-market` (US-5207) se apoya en eso. Pregunta de origen: [[Q-023 - Stock de una compra cancelada por HOLD_NOT_SETTLED]] (archivada).

## Decisión
Acordada por Patricio Fernandez y Mateo Conte el 2026-10-06 (opción 1 de Q-023).

- **La unidad queda retenida.** Con stock finito, `availableStock` no se recupera al cancelar por `HOLD_NOT_SETTLED`. Si `unitsSold` se cuenta (regla T1 de [[DEC-013 - Reglas de la tienda]], que implementa el PR #113), esa unidad tampoco suma como vendida: queda reservada "en cuarentena". En el ejemplo de la pregunta, una oferta de 10 queda con 9 disponibles y 0 vendidas, y entre todos los estudiantes nunca hay más de 10 ítems.
- **Es el comportamiento actual.** `cancelUnsettled` (`services/impl/OrderConfirmationServiceImpl.java`) no libera stock ni hold y deja un `ERROR` para revisión manual. Esta decisión lo convierte en regla, no lo cambia.
- **La T01 #5220 se redefine.** Pasa a fijar el comportamiento con una prueba (oferta de stock finito: tras `HOLD_NOT_SETTLED`, `availableStock` no vuelve al valor previo) y a corregir la documentación. Ya no hay "defecto" que reproducir.

## Alternativas descartadas
- **Devolver la unidad al stock** (opción 2, lo que pedía la T01): genera sobreventa, porque la unidad se vuelve a vender mientras el estudiante conserva el ítem, y rompe la regla de cuarentena del PR #113.
- **Retener hasta una resolución manual** (opción 3): es lo más correcto a largo plazo (volver a cobrar → vendida; quitar el ítem → vuelve al stock), pero necesita un endpoint nuevo y probablemente a Accounting o a Inventory. **No se descarta**: queda como trabajo futuro si estos casos resultan frecuentes.

## Consecuencias
- Código: ningún cambio de comportamiento. La T01 agrega una prueba que lo fija.
- Backlog: la T01 #5220 cambia de objetivo (título, descripción y estimación en Taiga a actualizar). El CA1 y el escenario 1 de [[S2-05 - Robustez de la compra]] y el CA2 y el escenario 2 de [[S2-OPC1 - Reconciliación de compras]] pasan a pedir que la unidad quede retenida.
- PR #113 de `tpi-market`: su regla de cuarentena queda respaldada por esta decisión.
- Un caso `HOLD_NOT_SETTLED` sigue sin forma de resolverse: el estudiante conserva un ítem que no pagó y la unidad queda retenida. Solo queda el `ERROR` del log.

## Notas afectadas
[[Q-023 - Stock de una compra cancelada por HOLD_NOT_SETTLED]], [[S2-05 - Robustez de la compra]], [[S2-OPC1 - Reconciliación de compras]], [[Estado actual del código]], [[Orden de compra]], [[Decisiones - Índice]].
