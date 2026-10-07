---
tipo: decision
estado: vigente
verificado_contra: equipo-accounting@2026-10-02
actualizado: 2026-10-02
tags: [mercado, decision, vidas, accounting]
---
# DEC-007 - Tope de vidas, Accounting decide y reporta

> Mercado **no valida** el tope de vidas. Accounting aplica su regla (hoy recorta, PAR-12) y reporta el resultado; Mercado reacciona a lo que Accounting informa.

## Contexto
Al comprar una vida podía validar el tope Mercado antes del hold (historia #142), rechazar Accounting (recomendación D1 del taller) o recortar Accounting (su código actual). Accounting ya es dueño del contador de vidas (`current_lives`, `reserved_lives`, `lives_ledgers`, `life_holds`) y recibe el tope de Backoffice con `GLOBAL_CONFIGURATION_CHANGED {initialLives, maxLives}` (PAR-12). Pregunta de origen: [[Q-002 - Vidas y tope de vidas]].

## Decisión
Decidida por el líder del equipo de Mercado el 2026-10-01:

- **Accounting decide**: aplica su regla del tope. Hoy es un recorte (crédito truncado y fila de libro con `delta` 0); la regla puede cambiar sin que Mercado lo decida.
- **Accounting reporta** el resultado de una compra de vida con tope alcanzado.
- **Mercado reacciona** a lo que Accounting reporta, por ejemplo liberando el hold o reflejándolo en el estado de la orden.
- **Mercado no valida antes del hold** ni consulta las vidas del estudiante.

Esta decisión **reemplaza** la recomendación D1 del taller (Accounting rechaza con `LIFE_CAP_REACHED` y Mercado libera el hold) y la historia #142 (validar con 422 `MAX_LIVES_REACHED`) ([[Taller de decisiones]]).

### Enmienda del 2026-10-02 (Cierre de la señal pendiente con Accounting)
Se acordó formalmente con el equipo de Accounting (Tema 08, grupo G12) la señal que la decisión original dejaba pendiente:
- Mercado publica `LIFE_PURCHASE_CONFIRMED` en el tópico `market.events` una vez confirmada la orden y debitadas las monedas en el hold (`COMMITTED`).
- Accounting aplica su regla de tope de vidas (acreditando hasta el máximo permitido, o 0 si ya alcanzó el tope sin reintegro de monedas).
- Accounting reporta las vidas efectivamente acreditadas emitiendo `LIFE_CREDITED` en `accounting.events`.
- Esta enmienda formaliza y cierra el acuerdo que DEC-007 y [[Q-002 - Vidas y tope de vidas]] dejaban pendiente de definición inter-servicio.

## Alternativas descartadas
- **Mercado valida antes del hold**: mejor experiencia, pero acopla Mercado al contador y requiere una consulta de vidas que Accounting no ofrece.
- **Accounting rechaza (D1)**: no se adopta como obligación; si Accounting decide rechazar en el futuro, Mercado reaccionará igual al evento correspondiente.

## Consecuencias
- **Enmienda de señal acordada el 2026-10-02**: Mercado emite `LIFE_PURCHASE_CONFIRMED` en `market.events` (contratos-kafka v5 con sobre canónico de 6 campos, 4 campos obligatorios en payload con `quantity >= 1`, particionado por `studentId` y deduplicación por `eventId`).
- **Accounting procesa el tope e informa**: Accounting consume `LIFE_PURCHASE_CONFIRMED` y reporta con `LIFE_CREDITED` en `accounting.events`.
- **Implementación**: Registrada en [[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]] y detallada en [[Integración con Accounting]].
- Aprovechar el mapeo de todos los motivos de rechazo de [[DEC-009 - Contrato de holds e ítems según Accounting]].
- La historia #142 cambia de enfoque ([[Épica 137 - Compra directa]]).

## Notas afectadas
[[Integración con Accounting]], [[Tipos de item]], [[Orden de compra]], [[Market Service - Overview]], [[Épica 137 - Compra directa]], [[Integración con Backoffice]], [[Taller de decisiones]], [[Roadmap de trabajo]], [[Decisiones - Índice]].
