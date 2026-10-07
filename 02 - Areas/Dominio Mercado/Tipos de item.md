---
tipo: entidad
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-04
tags: [mercado, dominio, items]
---
# Tipos de item

> Los cuatro tipos que Mercado puede vender: escudo, boost de XP, boost de monedas y vida. Cada uno tiene parámetros propios.

## Qué representa
El enumerado `ItemType` (`models/enums/ItemType.java`): `SHIELD`, `BOOST_XP`, `BOOST_COINS`, `LIFE`.

## Datos principales
| Tipo | En palabras | Parámetros | Valores de la plantilla |
|---|---|---|---|
| `SHIELD` | Escudo: absorbe un intento fallido sin perder una vida | Cargas; a qué desafíos aplica (`ChallengeApplicability`: `ALL`, `THEORETICAL_ONLY`, `PRACTICAL_ONLY`, `NO_EXAMS`) | 350 monedas, 2 cargas, `PRACTICAL_ONLY` |
| `BOOST_XP` | Boost de XP: multiplica la experiencia ganada | Multiplicador (mínimo 1.10); modo `BoostMode` | 400 monedas, x1.50, `TTL` 120 minutos |
| `BOOST_COINS` | Boost de monedas: multiplica las monedas ganadas | Multiplicador; modo `TTL` (duración) o `PER_EXAM` (intentos y `ConsumptionRule`: `ALWAYS_CONSUME` o `CONSUME_ON_PASS_ONLY`) | 300 monedas, x2.00, `PER_EXAM` 3 intentos, `CONSUME_ON_PASS_ONLY` |
| `LIFE` | Vida: devuelve vidas para seguir intentando | Vidas otorgadas | 500 monedas, 1 vida |

## Reglas de negocio
- Verbos de efecto previstos (`ABSORB_FAILURE`, `XP_MULTIPLIER`, `COIN_MULTIPLIER`, recomendación D3 del taller); un item equipado por verbo. Los efectos no se resuelven en Mercado ([[DEC-010 - Los efectos de los ítems no son de Mercado]]).
- Dónde vive cada efecto (código de accounting): el inventario y el escudo (`SHIELD`) los resuelve Accounting; los multiplicadores de XP y monedas, el motor de desafíos. Accounting no tiene lógica de `BOOST` ni de `LIFE` ([[Integración con Accounting]]).
- El inventario del estudiante es de Accounting ([[DEC-001 - Accounting es dueño del inventario]]); hoy su catálogo solo acepta `ITEM-PLACEHOLDER-1` a `3` y no las plantillas `tpl-*` de Mercado.
- El tope de vidas lo aplica Accounting al acreditar (recorta); desde el 2026-10-04 Mercado además lo valida antes del hold con `equip-summary` y PAR-12, y rechaza con 422 `LIFE_CAP_REACHED` la oferta que otorga más vidas de las que entran ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[S2-11 - Acuerdos de compra de vidas con Accounting]]). Al confirmarse una compra de vidas, Mercado emite `LIFE_PURCHASE_CONFIRMED` en `market.events` (omitiendo `ITEM_CONFIRMED`), y Accounting acredita hasta el tope informando con `LIFE_CREDITED` en `accounting.events` ([[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]]).
- Tipos nuevos propuestos (no acordados): [[Cofres y nuevos ítems]].

## Dónde vive en el código
`models/enums/*`, `seed/base-templates.json`, `validation/ValidOfferConfigurationValidator.java`.

## Relacionado
[[Plantilla base]], [[Oferta de catálogo]], [[Épica 131 - Inventario (otro equipo)]], [[Integración con Accounting]].
