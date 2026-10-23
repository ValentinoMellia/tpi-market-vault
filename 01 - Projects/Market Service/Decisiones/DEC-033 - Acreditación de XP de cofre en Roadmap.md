---
tipo: decision
estado: vigente
verificado_contra: equipo-roadmap@2026-10-16
actualizado: 2026-10-16
tags: [mercado, decision, cofres, roadmap, xp, kafka]
---
# DEC-033 - Acreditación de XP de cofre en Roadmap

> Cuando un cofre da XP, Mercado lo pide a Roadmap con un evento en `market.events`, después del cobro, idempotente por `order_id`. Roadmap lo asienta tal cual como una fuente nueva de XP (`MARKET_CHEST`), sin multiplicadores y sin evento de respuesta. Suma al nivel, al ranking y a las insignias de umbral, pero no al avance académico.

## Contexto
[[DEC-031 - Cofres configurables con ítems, monedas y XP]] permite premios de XP, y Roadmap es el dueño del XP ([[Integración con Roadmap]]). Hasta ahora cada movimiento de XP tenía que venir de un desafío (`challenge_id` obligatorio en `xp_movement`). Pregunta de origen: [[Q-029 - Acreditación de XP de cofre en Roadmap]].

Roadmap respondió el 2026-10-16 y dejó dos puntos para Mercado: si hace falta un evento de respuesta y a qué curso va el XP. Los definió Patricio Fernandez el mismo día.

## Decisión
- **Fuente nueva de XP en Roadmap.** En `xp_movement`, `challenge_id` pasa a ser opcional. Se suman `source_type` (`CHALLENGE` o `MARKET_CHEST`) y `reference_id`, que guarda el `order_id` con índice único. `section_id` queda vacío para los cofres.
- **Canal:** un evento en `market.events` desde el outbox de Mercado. No hay endpoint HTTP.
- **Idempotencia:** en la base de Roadmap, por `event_id` y por `reference_id` (`order_id`). Un reintento no suma dos veces.
- **Momento:** Mercado publica el evento solo después de debitar el precio del cofre.
- **Valor nominal.** Mercado manda la cantidad exacta que configuró el profesor. Roadmap no calcula ni multiplica: un `BOOST_XP` activo no afecta el XP del cofre.
- **Curso:** el XP va siempre a la cohorte de la orden (el cofre es una oferta de un curso).
- **Sin evento de respuesta (fire-and-forget).** Roadmap consume el evento y manda los errores no reintentables a `market.events.DLT`. No se usa saga porque no hay nada que deshacer: el XP se pide después del cobro, la compra ya terminó y el sorteo está guardado. Las fallas transitorias las cubren los reintentos de Kafka, y un evento en la DLT se corrige y se reenvía a mano.
- **Efectos del XP de cofre:**

| Qué | ¿Cuenta? |
|---|---|
| Nivel (`total_xp`, curva PAR-09) | Sí |
| Ranking (ordena por `total_xp`; desempate RF-RNK-11) | Sí |
| Progreso de grupo | Se ve en el XP total, pero no cambia el avance académico (nodos de desafío resueltos) |
| Insignias de umbral (`MIN_XP`, `LEVEL_REACHED`) | Sí |
| Insignias de resolución de nodos (`PER_NODE`, `SPECIFIC_MANDATORY_NODE`) | No |

## Alternativas descartadas
- **Endpoint HTTP:** Roadmap prefiere el evento por desacople y resiliencia, y la saga de Mercado ya usa el outbox.
- **Saga con respuesta de éxito y de falla (`CHEST_XP_CREDITED` / `CHEST_XP_FAILED`):** solo hace falta si una falla obliga a revertir o reembolsar, y acá no es el caso. Su único aporte sería que Mercado vea el premio como «entregado».
- **Respuesta solo ante falla, para marcar la orden en revisión:** se prefirió no sumar trabajo a Roadmap por un caso que solo produce un evento mal armado de Mercado.
- **Dejar el XP de cofre fuera del ranking:** Roadmap lo suma, y el desempate de RF-RNK-11 sigue priorizando el mérito académico.

## Consecuencias
- **Roadmap:** migración de `xp_movement` (`challenge_id` opcional, `source_type`, `reference_id` con índice único) y un listener de `market.events`. Lo hace Roadmap cuando la task T03 #8428 decida avanzar.
- **Mercado:** un evento nuevo en `market.events` con el `order_id`, la cohorte, el alumno y la cantidad de XP. El nombre y el payload se cierran al implementar, siguiendo `contratos-kafka` (`snake_case`). Nada cambia en el código hasta la T03.
- **Operación:** una orden de cofre con XP se da por cumplida al debitar. Si un evento cae a la DLT, el alumno pagó y no recibió el XP hasta que alguien lo reenvíe: hay que revisar `market.events.DLT`.
- **Monedas:** esta decisión no fija el modelo de respuesta de Accounting. Eso sigue en [[Q-028 - Acreditación de premios de cofre en Accounting]].

## Notas afectadas
[[Q-029 - Acreditación de XP de cofre en Roadmap]], [[Integración con Roadmap]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[Decisiones - Índice]].
