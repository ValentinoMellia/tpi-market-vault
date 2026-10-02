---
tipo: entidad
estado: borrador
verificado_contra: DEC-016
actualizado: 2026-10-01
tags: [mercado, dominio, subastas, fase-3]
---
# Subasta

> Intención del dominio: subastas de items entre estudiantes de un curso. Es de la Fase 3 y no existe código. Lo que sigue es lo que decía la documentación anterior, no comportamiento real.

## Qué representa
Una venta con ofertas crecientes, con duración de una hora a catorce días y precio mínimo opcional. Hay dos modos previstos: **abierta** (se ve la mejor oferta) y **ciega** (sealed-bid, planificada). Además, toda subasta entra en una **fase final ciega** durante sus últimos X minutos, duración configurable por subasta por el profesor que la lanza (anti-sniping, [[DEC-014 - Reglas de subastas]]).

## Datos principales
| Campo | Significado |
|---|---|
| Modo | Abierta o ciega ([[DEC-014 - Reglas de subastas]]) |
| Duración | 1 hora a 14 días ([[DEC-014 - Reglas de subastas]]) |
| Duración de la fase final (X) | Configurable por subasta, la define el profesor ([[DEC-014 - Reglas de subastas]]) |
| Ítem subastado | Una unidad de una oferta de catálogo, con snapshot al lanzar ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]) |
| Oferta mínima | Opcional |
| Incremento mínimo | Configurable por subasta |
| Versión | Bloqueo optimista ([[Bloqueo optimista]]) |

## Ciclo de vida / estados
`DRAFT`, `SCHEDULED`, `OPEN` (`NO_BIDS` o `ACTIVE_BIDS`), luego `CANCELLED` o cierre en curso (`EVALUATING_WINNER`, `CREDITING_ITEM`, `CONFIRMING_LEDGER`, `RELEASING_LOSERS` o `MARKED_DESERTED`) hasta `CLOSED` o `FAILED_SETTLEMENT` (con reintento). Las ofertas pasan por `ACTIVA`, `SUPERADA`, `GANADORA` y `LIBERADA`.

Impacto de [[DEC-014 - Reglas de subastas]] en los estados (previsto, sin código):
- **Fase final ciega** (2026-10-01): en los últimos X minutos las ofertas pasan a ser selladas (se puede ofertar sin ver las de los demás), el tiempo no se extiende y al cierre gana la más alta; el empate se resuelve con el dado. X es configurable por subasta; está **pendiente de detalle** si la oferta sellada debe superar a la última mejor visible.
- **Modo ciega**: no hay mejor oferta visible; al vencer el tiempo, `EVALUATING_WINNER` compara las ofertas selladas.
- **Desempate con dado** (solo ciega): si hay empate en `EVALUATING_WINNER`, se tira un dado; el servidor decide y registra el resultado de forma auditable, y la animación mostrada a los estudiantes empatados es solo presentación.
- **Superadas**: las ofertas `SUPERADA` conservan su hold hasta el cierre; se liberan todas juntas en `RELEASING_LOSERS` (con un release por postor).
- **Cancelación**: `CANCELLED` por profesor o por curso archivado libera un hold por postor.
- **Baja de un estudiante**: sus ofertas pasan a `LIBERADA` y la subasta sigue abierta.

## Reglas de negocio
Decidido ([[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] y [[DEC-014 - Reglas de subastas]]):
- La subasta termina cuando vence su tiempo o cuando un profesor la cancela; los estudiantes no pueden cancelar.
- **Qué se subasta** ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]): mientras no existan ítems únicos, una unidad de una oferta de catálogo basada en plantilla, con snapshot al lanzar; el motor no depende del tipo de ítem. "Ítem único" es una propuesta no aprobada ([[Ítems únicos]], [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] enmendada).
- Cancelación: un `HOLD_RELEASE_REQUESTED` por postor. Los superados recuperan sus monedas al cierre.
- Incremento mínimo configurable por subasta; duración máxima de 14 días.
- En subasta abierta una oferta debe superar estrictamente a la mejor (sin empates). En subasta ciega el empate se resuelve con un dado decidido por el servidor.
- Curso archivado: se cancelan las subastas abiertas. Baja de un estudiante: se retiran sus ofertas y la subasta continúa.
- El tiempo no se extiende; el anti-sniping es la fase final ciega descrita arriba.

Pendiente: si la oferta sellada debe superar a la última mejor visible. [[Q-017 - Qué se subasta mientras no existan ítems únicos]] y [[Q-012 - Alcance de subastas]] están archivadas.

Garantía elegida (decisión previa del equipo, sin `DEC` propia): cada oferta retiene el monto completo en Accounting ([[Hold de monedas]]). La alternativa de retener solo al líder fue rechazada ([[Ideas descartadas]]). Recomendaciones del [[Taller de decisiones]]: S1, S3, S5 y S6 confirmadas, S10 reemplazada.

Lo que ya soporta Accounting: `orderType` `AUCTION_BID`, `HOLD_INCREASE_REQUESTED` y release con `AUCTION_LOST` o `AUCTION_CANCELLED`, con `ttlSeconds` obligatorio. Sin liberación en lote y con un hold por `orderId` para siempre ([[Integración con Accounting]]). El 2026-10-01 accounting propuso cancelar con un solo release por `orderId`; **no se adopta** y se le comunica que Mercado envía uno por postor. También recordó que `HOLD_INCREASE_REQUESTED` lleva el total nuevo, no la diferencia.

## Dónde vive en el código
No existe.

## Relacionado
[[Épica 577 - Subastas]], [[Ítems únicos]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[Integración con Notificaciones]], [[DEC-014 - Reglas de subastas]], [[Integración con Cursos]].
