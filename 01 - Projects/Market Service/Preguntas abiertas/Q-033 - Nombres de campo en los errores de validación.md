---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@e63dcb47
actualizado: 2026-10-23
tags: [mercado, pregunta-abierta, errores, api, snake-case]
---
# Q-033 - Nombres de campo en los errores de validación

> Los errores 400 de Mercado nombran el campo que falla de dos maneras: los de negocio de metas y cofres con el nombre del cable en `snake_case` (`rarity_weights`) y los de Bean Validation y Jackson con el nombre Java en `camelCase` (`coinPrice`). ¿Se unifica, y hacia cuál?

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| [[Errores de la API]] | Los valores de `errors[].field` son rutas Java en `camelCase` (por ejemplo `offerId`); solo las claves del objeto van en `snake_case` | Convención del vault, verificada contra `80a6aeac` |
| Errores de negocio de metas | `closes_at`, `target_amount`, `reward_item.configuration.*` | `services/impl/GoalRules.java`, `services/impl/GoalRewardItemResolver.java` |
| Errores de negocio de cofres | `prizes`, `prizes[i].reward_kind`, `prizes[i].source_offer_id`, `rarity_weights`, `version`, `page` | Cambiado a `snake_case` por Patiño en la review de la PR 270 de `tpi-market` (commit `7b8a1ad81`), para que coincida con el pedido y con las metas |
| Bean Validation y Jackson, en todo el servicio | `coinPrice`, `purchaseLimit.maxPerStudent`, `rarityWeights.epic`, `prizes[0].sourceOfferId` | `controllers/FieldErrorMapper.java`: usa `FieldError.getField()` y convierte los nombres de Jackson con `toCamelCase`, a propósito |
| Review de Patiño en la PR 270 | Dejó Bean Validation sin cambiar porque es una decisión de todo el servicio y no de los cofres | Comentario de la PR 270 |

## Qué hace hoy el código
Verificado en `develop@e63dcb47`, bajo `src/main/java/ar/edu/utn/frc/tup/p4/`:

- `FieldErrorMapper.fromBindingResult` arma los errores de `@Valid` con la ruta de la propiedad Java. Un cofre con `coin_price` en 0 responde `field: "coinPrice"`.
- `FieldErrorMapper.fromJackson` pasa los nombres de Jackson a `camelCase`. Un `coin_price` no entero (`100.5`) también responde `coinPrice`.
- Los errores de negocio se arman en cada servicio con el nombre del cable:
  - **Metas:** constantes `FIELD_*` de `GoalRules`.
  - **Cofres:** `ChestRules`, `ChestPrizeResolver`, `ChestEvaluator`, `ChestEditGuard` y `ChestQueryServiceImpl`.
- Un mismo 400 puede mezclar los dos estilos. Por ejemplo, un cofre con el precio en 0 y sin premios responde 400 de Bean Validation (`coinPrice`). Si el precio es válido y no hay premios, el 400 de negocio dice `prizes`. Hoy los dos no salen juntos, porque `@Valid` corta antes, pero el cliente tiene que aceptar los dos estilos.
- Los ejemplos de OpenAPI de cofres (`configs/SpringDocConfig.java`, `addChestExamples`) todavía muestran `camelCase` en los errores de negocio (`prizes[0].sourceOfferId`, `rarityWeights`), aunque el código emite `snake_case`.

## Opciones
1. **Todo en `snake_case`.** `FieldErrorMapper` traduce la ruta Java al nombre del cable (`@JsonProperty`).
   - Ventajas: el campo del error coincide con el campo que mandó el cliente, en todo el servicio.
   - Desventajas: cambia todos los errores de validación existentes. Hay que revisar el frontend, que hoy convierte las claves con un interceptor y podría depender de los valores en `camelCase`. También hay que actualizar [[Errores de la API]] y los tests.
2. **Todo en `camelCase`.** Las metas y los cofres vuelven a la ruta Java.
   - Ventajas: coincide con la convención documentada.
   - Desventajas: deshace el fix de la review de la PR 270, y el campo deja de coincidir con el cuerpo `snake_case` que mandó el cliente.
3. **Dejarlo como está y documentarlo:** negocio en `snake_case`, validación estructural en `camelCase`.
   - Ventajas: no cambia código.
   - Desventajas: el cliente tiene que entender dos estilos, y la regla no se deduce de la respuesta.

## Recomendación
Opción 1, si el frontend confirma que no depende de los valores en `camelCase`. Es la que hace coincidir el error con el cuerpo que se mandó. En cualquier caso, corregir los ejemplos de OpenAPI de cofres para que muestren lo que el código emite.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado decide. Hay que confirmar con el frontend de Mercado (`2026-PIV-TPI-FE`) cómo lee `errors[].field` para mostrar el error junto a cada campo.

## Resolución
Pendiente. Notas afectadas: [[Errores de la API]], [[Cofre]], [[Estado actual del código]].
