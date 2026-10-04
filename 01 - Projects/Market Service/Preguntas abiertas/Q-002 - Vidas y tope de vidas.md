---
tipo: pregunta
estado: archivado
verificado_contra: DEC-007
actualizado: 2026-10-02
tags: [mercado, pregunta-abierta, vidas]
---
# Q-002 - Vidas y tope de vidas

> ¿Dónde se valida el tope al comprar una vida: Accounting recorta, Accounting rechaza o Mercado valida antes del hold? El dueño del contador ya se verificó: es Accounting. **Resuelta**: Accounting decide y reporta, Mercado reacciona; ver [[DEC-007 - Tope de vidas, Accounting decide y reporta]].

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Roadmap | El equipo de Roadmap (Tema 10) administra las vidas | Contexto de Sprint 1 |
| Accounting (código) | Es dueño del contador (`current_lives`, `reserved_lives`, `lives_ledgers`, `life_holds`) y **recorta sin rechazar**: crédito truncado y fila de libro con `delta` 0 | Código de accounting (`develop`) |
| Inventario | Las vidas como item de inventario | Documentos de flujo |
| Mercado valida | Chequeo previo al hold con error 422 `MAX_LIVES_REACHED` | Historia #142 |
| Taller D1 | Accounting rechaza con `LIFE_CAP_REACHED` y Mercado libera el hold | Taller del equipo ([[Taller de decisiones]]) |

## Recomendación del taller del equipo
D1: que Accounting rechace con `LIFE_CAP_REACHED` y que Mercado libere el hold. **Contradice el código de accounting**, que hoy recorta. Por la jerarquía de verdad, para el lado de accounting manda su código hasta que se decida otra cosa.

## Evidencia nueva
- El tope PAR-12 llega desde Backoffice con `GLOBAL_CONFIGURATION_CHANGED {initialLives, maxLives}` (valores por defecto 3 y 3). Ver [[Integración con Backoffice]].
- `LIFE_PURCHASE_CONFIRMED` fue acordado formalmente con Accounting el 2026-10-02 e implementado en Mercado para emitirse en `market.events` tras confirmar el hold de monedas ([[Integración con Accounting]], [[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]]).
- Mercado no es responsable del contador ([[Market Service - Overview]]).

## Qué hace hoy el código de Mercado
Existe `LIFE_CAP_REACHED` en `models/enums/OrderRejectionReason.java`, pero no se usa; no hay tope ni consulta de vidas. Ver [[Tipos de item]].

## Opciones
1. **Accounting rechaza (D1).** Error claro y sin acoplar Mercado al contador; la compra falla tarde y obliga a liberar el hold. Exige cambiar el código de accounting.
2. **Accounting recorta (código actual).** Simple; el estudiante paga por vidas que no recibe.
3. **Mercado valida antes del hold.** Mejor experiencia; requiere una consulta de vidas a Accounting que hoy no existe.

## Recomendación (histórica)
Opción 1 como línea del taller. Quedó **superada** por la decisión: ni la opción 1 ni la 3 son obligatorias; Mercado no valida el tope.

## Quién decide / con qué equipo hay que hablar
Accounting (Tema 08, grupo G12 en Taiga) y Roadmap. Relacionada: [[Q-007 - Contrato con Accounting]], [[Épica 137 - Compra directa]].

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: Accounting aplica su regla del tope (hoy recorta, PAR-12) y reporta el resultado; Mercado **no valida** el tope y reacciona a lo que Accounting informe. Reemplaza a D1 del taller. Ver [[DEC-007 - Tope de vidas, Accounting decide y reporta]]. El 2026-10-02 se cerró la señal pendiente: Mercado publica `LIFE_PURCHASE_CONFIRMED` en `market.events` tras confirmar el hold, y Accounting acredita aplicando su tope y reportando con `LIFE_CREDITED` en `accounting.events` (enmienda a DEC-007, [[Integración con Accounting]]).
