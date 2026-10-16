---
tipo: integracion
estado: borrador
verificado_contra: roadmap@c7d60f9
actualizado: 2026-10-16
tags: [mercado, integracion, roadmap, xp]
---
# Integración con Roadmap

> Roadmap (Tema 10) es el dueño del XP, el nivel, el ranking y las insignias del alumno. Hoy Mercado no intercambia nada directo con Roadmap. La relación aparece con los cofres que dan XP ([[DEC-031 - Cofres configurables con ítems, monedas y XP]]) y todavía no está acordada ([[Q-029 - Acreditación de XP de cofre en Roadmap]]).

## Equipo y responsabilidad
Servicio `roadmap-service` (repositorio `2026-P4-BE/tpi-roadmap`). Datos verificados contra `c7d60f9` (2026-10-14):

| Dato | Valor |
|---|---|
| Puerto | 8010 (gestión 8011) |
| Registro | Eureka como `roadmap-service` |
| Kafka | grupo consumidor `tema-10-roadmap-service-group` |
| Tópicos que escucha | `challenges.events`, `accounting.events`, `administration.events`, `courses.events` |

Es dueño de:

- **XP:** libro `xp_movement` (`entities/XpMovementEntity.java`), con `event_id` único para la idempotencia y `challenge_id` obligatorio.
- **Nivel, ranking y progreso de grupo:** se calculan a partir del XP total (`LevelService`, `models/RankingEntry.java`, `GroupProgressService`).
- **Insignias:** después de sumar XP, `badgeEvaluator.awardEarned(...)` evalúa los criterios.

Según [[Mapa de servicios]], también le pide a Accounting equipar y desequipar ítems.

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| — | — | — | Hoy no hay comunicación directa |
| Mercado → Roadmap (propuesto) | Kafka, `market.events` | Acreditación de XP de un cofre, idempotente por `orderId` | Entregar un premio de XP ([[Q-029 - Acreditación de XP de cofre en Roadmap]]) |

## Estado actual en el código
- Mercado no tiene cliente ni evento hacia Roadmap.
- Roadmap registra XP solo desde resultados de desafíos (`services/ProgressService.java`, consumidos por `events/RoadmapEventListener.java`). No escucha `market.events`.

## Acuerdos pendientes
- Fuente nueva de XP para los cofres, canal e idempotencia: [[Q-029 - Acreditación de XP de cofre en Roadmap]].
- Si el XP de cofre cuenta para el nivel, el ranking, el progreso de grupo y las insignias.

## Relacionado
[[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[Cofres y nuevos ítems]], [[Integración con Accounting]], [[Mapa de servicios]].
