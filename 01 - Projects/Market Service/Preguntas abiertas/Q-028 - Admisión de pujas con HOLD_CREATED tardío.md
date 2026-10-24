---
tipo: pregunta
estado: archivado
verificado_contra: PR-300@26c7959e5
actualizado: 2026-10-24
tags: [mercado, pregunta-archivada, subastas, holds]
---
# Q-028 - Admisión de pujas con HOLD_CREATED tardío

> ¿Se admite una puja aceptada por HTTP antes de `endsAt` si Accounting confirma su hold después del cierre o vencimiento? **Resuelta**: el hold solo se admite si la subasta sigue abierta y `endsAt` es posterior al momento en que Mercado procesa `HOLD_CREATED`; el hold tardío se devuelve y la puja no cambia el resultado. Ver la enmienda de [[DEC-014 - Reglas de subastas]].

## Contexto

Mercado acepta la solicitud de puja como pendiente mientras solicita a Accounting el hold. Accounting puede estar demorado y responder cuando ya venció `endsAt`, incluso antes de que el job alcance a cerrar la subasta. La solicitud HTTP aceptada todavía no representa una puja confirmada ni un hold reservado.

## Opciones consideradas

1. **Usar el tiempo de solicitud HTTP** y admitir el hold aunque llegue después del cierre.
2. **Usar el corte de `endsAt` al procesar `HOLD_CREATED`**: si la subasta ya no está `OPEN` o el fin no es posterior al reloj de Mercado, rechazar el intento y devolver el hold.
3. Esperar a que corra el job de cierre para decidir si se admite el hold.

## Resolución

Cerrada el 2026-10-24 mediante la enmienda a [[DEC-014 - Reglas de subastas]], al resolver el review de PR #300. Se elige la opción 2: el límite es el tiempo de cierre definido por `endsAt`, no el momento de la solicitud ni el retraso del job. Una concesión tardía no activa la puja ni modifica el conjunto de candidatos; Mercado la devuelve por outbox. El motivo es `AUCTION_CANCELLED` cuando la subasta fue cancelada y `AUCTION_LOST` cuando venció. La puja queda `HOLD_REQUESTED` hasta el acuse de Accounting y luego pasa a `RELEASED`.

La regla queda implementada en el cambio `26c7959e5` de tpi-market, pendiente de merge en PR #300. El test de saga verifica la devolución y que la puja no se active.
