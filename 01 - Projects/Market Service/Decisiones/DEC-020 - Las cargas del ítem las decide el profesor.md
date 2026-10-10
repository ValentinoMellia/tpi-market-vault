---
tipo: decision
estado: vigente
verificado_contra: codigo@6926af1d, accounting@10bb4ec
actualizado: 2026-10-10
tags: [mercado, decision, accounting, inventario, oferta]
---
# DEC-020 - Las cargas del ítem las decide el profesor

> `maxCharges`, el campo de `ITEM_CONFIRMED` con el que Accounting acredita un ítem, representa las cargas que el profesor configuró en la oferta (`charges`). Mercado lo manda en cada compra; Accounting no tiene un catálogo de cargas propio.

## Contexto
El profesor configura en cada [[Oferta de catálogo]] cuántas cargas tiene el ítem (`charges`; la [[Plantilla base]] propone un valor por defecto en `defaultCharges`). Por su lado, Accounting guarda en cada unidad del inventario `max_charges`, y de ahí arranca `remaining_uses`, que se descuenta cada vez que el ítem se consume. Hasta ahora los dos valores no estaban conectados: `ITEM_CONFIRMED` no llevaba las cargas, y Accounting las tomaba de un `InventoryCatalog` fijo que solo acepta `ITEM-PLACEHOLDER-1` a `3`. Por eso las cargas que elegía el profesor no llegaban al estudiante.

La recomendación D10 del [[Taller de decisiones]] proponía que Accounting tomara las cargas del payload, y había quedado fuera de [[DEC-009 - Contrato de holds e ítems según Accounting]]. Accounting preguntó de dónde sale `maxCharges` (OQ-1, [G12-HU58] T01 #5639 en Taiga). El 2026-10-06 Mercado respondió que las cargas viajan en el payload (opción a). Accounting ya lo implementó: acepta `maxCharges` y `applicableChallengeScope` en `ITEM_CONFIRMED` y los guarda en la instancia ([G12-HU58] T02 #5640, cerrada el 2026-10-08). Pregunta de origen: [[Q-007 - Contrato con Accounting]] (archivada), punto D10.

## Decisión
Registrada por Valentino Mellia el 2026-10-10.

- **`maxCharges` son los usos que decide el profesor.** Se toman de la oferta que se compró, tal como estaba al momento de la compra.
- **Mercado lo manda en `ITEM_CONFIRMED`**, junto con los siete campos que ya envía ([[Integración con Accounting]]).
- **Accounting no define cargas.** No mantiene un catálogo propio de cargas: acredita la unidad con el `maxCharges` que recibe.
- **Mercado no inventa valores.** Manda lo que configuró el profesor; cómo se consume o vence un ítem es de Accounting ([[DEC-010 - Los efectos de los ítems no son de Mercado]]).

Qué manda Mercado según el tipo de ítem:

| Tipo de ítem | `maxCharges` | Otros campos |
|---|---|---|
| `SHIELD` | `charges` de la oferta | `applicableChallengeScope` = `applicableChallenges` de la oferta (mismos valores que el enum de Accounting) |
| `BOOST_XP` / `BOOST_COINS` en modo `PER_EXAM` | `attempts` de la oferta (evaluaciones cubiertas) | `applicableChallengeScope` = `null` |
| `BOOST_XP` / `BOOST_COINS` en modo `TTL` | `null` | `multiplier`, `durationMinutes` y `consumptionRule`, como pide la [G12-HU88] de Accounting |
| `LIFE` | No aplica: las vidas no viajan por `ITEM_CONFIRMED` sino por `LIFE_PURCHASE_CONFIRMED` ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]) | — |

## Alternativas descartadas
- **Mandar 1 carga en los ítems sin cargas** (propuesto el 2026-10-10 para destrabar los boosts): en un boost `PER_EXAM` pisa las evaluaciones que eligió el profesor, y en un boost `TTL` lo convierte en un ítem de un solo uso, que ignora la duración. Además decide por Accounting cómo se consume un ítem, y su HU58 prohíbe un valor por defecto "para destrabar".
- **Catálogo de cargas en Accounting** (la situación actual, `InventoryCatalog`): ignora lo que configura el profesor y obliga a mantener dos fuentes del mismo dato.
- **Eventos de catálogo o semilla estática** (las otras opciones de la OQ-1): agregan un canal de sincronización entre servicios sin beneficio, porque el valor ya está disponible en la oferta al momento de comprar.

## Consecuencias
- Código de Mercado: hoy `ITEM_CONFIRMED` sale sin `maxCharges` (`tpi-market` en `6926af1d`; `charges` está en `entities/CourseCatalogOfferEntity.java`). Agregar los campos de la tabla queda en la T01 #7698 de [[S2-12 - Saga de compra según la Propuesta C]].
- Accounting (`tpi-accounting` en `develop`, `10bb4ec`): `ItemConfirmedInboundHandler` exige `maxCharges` mayor que 0 y manda al DLT, sin reintentos, un `maxCharges` ausente, nulo o no positivo y un `applicableChallengeScope` desconocido. `applicableChallengeScope` nulo equivale a `ALL`. El `InventoryCatalog` con placeholders ya no existe.
- **Bloqueo de los boosts `TTL`:** hasta que Accounting cierre la [G12-HU88] (hoy en su backlog, sin sprint ni responsable), un boost `TTL` va al DLT: el estudiante paga y no recibe el ítem. Mercado le pide a Accounting, en el issue #204 de `tpi-accounting`, que lo trate como bloqueante. Mientras tanto se recomienda no publicar ni vender ofertas de boost `TTL`; esa medida no está decidida.
- El vault deja de describir las cargas como fijas en Accounting ([[Integración con Accounting]], [[Taller de decisiones]]).

## Notas afectadas
[[Integración con Accounting]], [[Taller de decisiones]], [[Q-007 - Contrato con Accounting]], [[Oferta de catálogo]], [[Decisiones - Índice]], [[S2-12 - Saga de compra según la Propuesta C]].
