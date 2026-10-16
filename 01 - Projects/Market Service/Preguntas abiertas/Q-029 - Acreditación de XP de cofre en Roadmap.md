---
tipo: pregunta
estado: archivado
verificado_contra: DEC-033
actualizado: 2026-10-16
tags: [mercado, pregunta-archivada, cofres, roadmap, xp]
---
# Q-029 - Acreditación de XP de cofre en Roadmap

> Un cofre puede dar XP, y el XP es de Roadmap, que hoy solo lo registra a partir de desafíos. Hay que acordar con Roadmap cómo Mercado le pide sumar XP de un cofre, con idempotencia por orden. También si aceptan que ese XP mueva el nivel, el ranking y las insignias.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Mercado | Un cofre puede dar XP. Mercado sortea y pide acreditar el premio ([[DEC-031 - Cofres configurables con ítems, monedas y XP]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]]) | Decisiones de Mercado |
| Roadmap | Cada movimiento de XP pertenece a un desafío: `challenge_id` es obligatorio | Código de `tpi-roadmap` |

No es una contradicción con el PRD: el PO habilitó el XP en los cofres, y [[DEC-032 - Sorteo y reglas de configuración de los cofres]] aclara que RF-INT-02 no se aplica ahí. Es un contrato que no existe.

## Qué hace hoy el código
En `tpi-roadmap` (`c7d60f9`, 2026-10-14):

- `entities/XpMovementEntity.java` (tabla `xp_movement`) es el libro del XP. Tiene `event_id` único (idempotencia), `course_cohort_id`, `student_id`, `challenge_id` obligatorio, `section_id` y `xp`.
- `services/ProgressService.java` escribe movimientos solo desde los resultados de desafíos que consume `events/RoadmapEventListener.java` (tópico `challenges.events`). No escucha `market.events`.
- El XP total define el nivel (`LevelService`, PAR-09 del PRD), el ranking (`models/RankingEntry.java`) y el progreso de grupo. Además, después de sumar XP, `badgeEvaluator.awardEarned(...)` evalúa las insignias.

Detalle del servicio en [[Integración con Roadmap]].

## Opciones
1. **Fuente nueva de XP, pedida por evento.** `challenge_id` pasa a opcional, con un tipo de origen o una referencia a la orden, y Roadmap escucha un evento de Mercado en `market.events`, idempotente por `orderId`. Es el mismo canal que el resto de la saga.
2. **Lo mismo, pedido por HTTP.** Respuesta sincrónica, pero Roadmap hoy recibe el XP solo por Kafka.
3. **XP de cofre en un libro aparte, fuera del ranking.** Protege la competencia del ranking. Es más trabajo para Roadmap y contradice la idea de que el XP es uno solo.

## Recomendación
Opción 1, idempotente por `orderId`. Mercado pide la acreditación solo después de que se debitó el precio del cofre. Que el XP de cofre cuente para el nivel, el ranking y las insignias es lo coherente con la aprobación del PO, pero lo tiene que aceptar Roadmap.

## Quién decide / con qué equipo hay que hablar
Roadmap (Tema 10). Patricio les lleva la pregunta (task T02 #8427 de la US-8400). Preguntas concretas:

1. ¿Aceptan una fuente de XP que no es un desafío? ¿Con qué forma: `challenge_id` opcional más un tipo de origen, u otra?
2. ¿Prefieren que se pida por evento (`market.events`) o por HTTP?
3. ¿El XP de cofre cuenta para el nivel, el ranking, el progreso de grupo y las insignias?
4. ¿Publican un evento de respuesta (acreditado o rechazado)?
5. ¿El XP de cofre se multiplica por un `BOOST_XP` activo? La propuesta original del equipo sugería que no: es XP de recompensa, no de desafío.

## Resolución
Archivada el 2026-10-16. Roadmap aceptó la opción 1: `challenge_id` opcional, `source_type` (`MARKET_CHEST`) y `reference_id` con el `order_id`, por evento en `market.events`. El XP de cofre cuenta para el nivel, el ranking y las insignias de umbral, no para el avance académico, y un `BOOST_XP` no lo multiplica. Mercado definió que no hay evento de respuesta y que el XP va a la cohorte de la orden. Registrado en [[DEC-033 - Acreditación de XP de cofre en Roadmap]].
