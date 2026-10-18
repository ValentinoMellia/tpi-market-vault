---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-17, equipo-accounting@2026-10-17
actualizado: 2026-10-17
tags: [mercado, decision, subastas, accounting, holds]
---
# DEC-032 - Retiro definitivo y contrato de holds de subastas

> El alumno puede retirar su oferta, recupera el monto disponible sin cobro y no puede volver a pujar en esa subasta. Las mejoras reutilizan el mismo hold PENDING. Resuelve [[Q-028 - Retiro y re-oferta frente al ciclo del hold]].

## Contexto y aprobación

Decisión explícita del usuario; [respuesta aprobada y publicada a Accounting](https://github.com/2026-P4-BE/tpi-market/issues/200#issuecomment-6244678432). Sustituye el planteo previo de permitir retiro y re-oferta reportado a partir de la conversación con Hernán.

## Decisión

- Retirar emite HOLD_RELEASE_REQUESTED / AUCTION_BID_WITHDRAWN: devuelve el monto al disponible sin cobro y deja el hold RELEASED definitivamente. Mercado refleja la confirmación asíncrona; la devolución no espera el cierre.
- El alumno queda fuera de esa subasta. Mercado bloquea nuevas pujas antes del create; HOLD_ALREADY_EXISTS es defensa adicional.
- Una mejora de oferta activa reutiliza PENDING con HOLD_INCREASE_REQUESTED y total nuevo; espera HOLD_INCREASED. No reactiva RELEASED ni necesita otro hold por mejora.
- Se acepta el tope configurable de TTL de 16 días (14 días más 24 horas caben) y rechazo INVALID_HOLD_STATE al confirmar después de expires_at, aunque el job aún no haya liberado.
- La baja libera con ACCOUNT_DEACTIVATED, correlation_id nulo, sin doble release ni AUCTION_BIDDER_UNENROLLED.
- La respuesta de extensión por orden usa order_id según el contrato consultado. La clave por postor studentId:courseId permanece documentada como propuesta; esta decisión no registra una nueva aceptación de esa clave.

## Consecuencias y pendientes

Mercado debe persistir la exclusión y resolver idempotencia, concurrencia y respuestas tardías. AUCTION_BID_WITHDRAWN todavía no existe en el enum de Accounting: su entrega continúa pendiente. No se afirma que el retiro esté implementado.

El retiro no cancela toda la subasta ni equivale a bajar una puja activa. Las restricciones de fase todavía no confirmadas del spike siguen siendo propuesta. No cambian cierre fijo, dado vigente de [[DEC-014 - Reglas de subastas]] / [[Q-025 - Desempate de las subastas]] ni alcance de la saga C, decidida solo para compra directa. Los acuerdos de meta colectiva se mantienen separados.

## Alternativas descartadas

Retiro con re-oferta: sustituido por retiro definitivo. Reabrir RELEASED mediante aumento: no es parte del contrato. Prohibir todo retiro: no satisface lo aprobado.

## Relacionado

[[Subasta]], [[Integración con Accounting]], [[Flujos de compra directa y subasta]], [[Seguimiento con Accounting - Subastas y holds]], [[Decisiones - Índice]].
