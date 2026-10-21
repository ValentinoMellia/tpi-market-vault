---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@25917cf5b
actualizado: 2026-10-21
tags: [mercado, pregunta-abierta, subastas, outbox]
---
# Q-030 - Agregado de los eventos de la subasta entera en el outbox

> [[DEC-038 - La puja es el agregado de la saga de subastas]] resuelve las filas del outbox de cada postor, pero no las que pertenecen a la subasta entera (por ejemplo, los avisos de apertura y de resultado): la subasta tiene id UUID y el outbox exige un `aggregate_id` `Long`.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Outbox de Mercado | `aggregate_id BIGINT NOT NULL` | `V1__baseline.sql`, `entities/OutboxEventEntity.java` |
| Subasta | `id UUID` | `V12__auctions_schema.sql`, `entities/AuctionEntity.java` |
| Task #11471 (US #8395) | Publicar por outbox los avisos de apertura, oferta superada y resultado o cancelación | Taiga |

## Qué hace hoy el código
Ninguna clase de subastas escribe en el outbox. El catálogo resuelve un caso parecido con el tipo `AGGREGATE_OFFER` y el id `Long` de la oferta (`clients/impl/OutboxCatalogEventPublisher.java`).

## Opciones
1. **Usar otro id `Long` como agregado**: por ejemplo la puja que provoca el aviso (oferta superada) o la ganadora (resultado). No sirve para la apertura ni para una subasta desierta o cancelada sin pujas.
2. **Mapeo local estable**: una columna `Long` propia de la subasta (secuencia) solo para el outbox. Cubre todos los casos sin tocar el outbox.
3. **Columna `aggregate_ref` UUID en el outbox solo para estas filas**: es la alternativa que [[DEC-038 - La puja es el agregado de la saga de subastas]] descartó para la saga, acotada a los avisos.

## Recomendación
Opción 2, salvo que el contrato que se acuerde con Notificaciones en #11471 no necesite filas a nivel subasta.

## Quién decide / con qué equipo hay que hablar
Equipo de Mercado, con el responsable de la task #11471. Afecta el contrato con [[Integración con Notificaciones]] solo en la key de partición.

## Resolución
Pendiente.
