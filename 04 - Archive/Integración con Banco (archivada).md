---
tipo: integracion
estado: archivado
verificado_contra: ninguno
actualizado: 2026-10-01
tags: [mercado, archivo, banco, accounting]
---
# Integración con Banco (archivada)

> Nota superada: "Banco" fue renombrado Accounting (ex Banco). El contenido vigente está en [[Integración con Accounting]].

## Motivo del archivo
- Rename del equipo: Banco pasó a llamarse accounting / `accounting-service`.
- La lectura del código de accounting (`develop`, 2026-10-01) corrigió el contrato: un solo tópico `accounting.events`, `orderId` en UUID canónico, motivo `INSUFFICIENT_BALANCE` y TTL fijo de 300 s para compras directas.
- Esta nota describía los tópicos `accounting.holds.*` del código de Mercado como si fueran el contrato; hoy se tratan como una diferencia a corregir.

Ver también [[DEC-001 - Accounting es dueño del inventario]] y [[Ideas descartadas]].
