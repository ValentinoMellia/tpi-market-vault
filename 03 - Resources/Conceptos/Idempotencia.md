---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, idempotencia]
---
# Idempotencia

> Una operación idempotente produce el mismo resultado aunque se repita; evita cobrar dos veces por un doble clic o un reintento.

## El problema que resuelve
Los clientes reintentan y las redes duplican peticiones. Sin protección, una compra podría ejecutarse dos veces.

## Cómo funciona
El cliente envía una clave única por intención. El servidor guarda la clave con una huella de la solicitud; si llega de nuevo con la misma huella devuelve el resultado original, y con otra huella rechaza el conflicto.

## Cómo lo usamos en Mercado
`POST /api/market/courses/{courseId}/orders` recibe `idempotencyKey` en el cuerpo. `PurchaseIdempotencyService.executeOnce` calcula una huella SHA-256 de estudiante, curso y oferta; la clave es única (`uk_orders_idempotency_key`). Una clave repetida con otra solicitud da `idempotency-key-conflict` ([[Errores de la API]]). Ver [[Orden de compra]] y [[DEC-005 - Endpoints y prefijos según el código]] (cuerpo y no cabecera).

## Relacionado
[[Saga]], [[Entrega at-least-once y deduplicación]], [[Épica 137 - Compra directa]].
