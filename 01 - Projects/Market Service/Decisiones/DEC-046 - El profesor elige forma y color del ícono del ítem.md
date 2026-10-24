---
tipo: decision
estado: vigente
verificado_contra: codigo@b195eee25, frontend@d5065ddfe, ui-kit@v0.11.1, equipo-mercado@2026-10-24
actualizado: 2026-10-24
tags: [mercado, decision, oferta, icono, accounting, frontend]
---
# DEC-046 - El profesor elige forma y color del ícono del ítem

> La forma (`icon_shape`) y el color (`icon_variant`) del ícono de un ítem los elige el profesor y se guardan con la [[Oferta de catálogo]]. Órdenes, metas, subastas y cofres copian ese ícono al crearse, y `ITEM_CONFIRMED` lo podrá llevar a Accounting detrás de una propiedad apagada.

## Contexto
En el formulario de oferta del frontend (`features/marketplace/ui/offer-form` con `item-icon-picker`, `2026-PIV-TPI-FE` en `develop@d5065ddfe`) el profesor ve un ícono que no puede guardar:

- **La forma sale de la fuerza del ítem.** `spriteTier` (`features/marketplace/ui/catalog-offer/catalog-offer-view.ts`) la calcula de la configuración: escudo según las cargas (tope 4), vida según las vidas (tope 3) y boosts según el multiplicador (hasta 1.25 → 1, hasta 1.75 → 2, el resto 3). Si el profesor cambia las cargas, cambia el dibujo.
- **El color nunca llega al backend.** La US `#10571` agregó un selector de color con paletas propias del frontend (`item-icon-picker/item-icon-variants.ts`), pero dejó la persistencia fuera de alcance; la US `#11558` solo lo pasó a un popover. Al recargar, el color elegido se pierde.
- **El backend no tiene dónde guardarlo.** `CourseCatalogOfferEntity` (tabla `course_catalog_offers`) no tiene columnas de ícono, y la vitrina devuelve en `StorefrontOfferDto.icon` un texto fijo por tipo (`resolveIcon` en `services/impl/StorefrontCatalogServiceImpl.java`: `shield-rune`, `potion-violet`, `coin-magnet`, `heart-flask`). Tampoco lo copian `OrderEntity`, `GoalEntity`, `AuctionItemSnapshot` ni `ChestRewardEntity`, y `ITEM_CONFIRMED` (`dtos/events/ItemConfirmedPayloadDto.java`) no lo lleva (`tpi-market` en `develop@b195eee25`).

Mientras tanto, el UI kit (`@2026-p4-fe/ui` `^0.11.1`, `projects/tpi-ui/lib/item-icon/`) ya dibuja ambas cosas: `GenericItemIcon` recibe `tier` (escudo hasta 4; vida, boost de XP y boost de monedas hasta 3) y `variant` (`ItemIconVariant`: `default`, `azure`, `amethyst`, `amber`, `emerald`, `crimson`).

No hay `Q-NNN` de origen: la decisión se tomó con el equipo de Mercado el 2026-10-24, al crear la US `#13382` (T01 `#13383`).

## Decisión
1. **Forma libre.** `icon_shape` es un entero que elige el profesor: escudo de 1 a 4; vida, boost de XP y boost de monedas de 1 a 3 (los mismos topes que el kit). El kit recibe ese número como `tier`, pero el contrato lo llama `icon_shape`: elige una forma y no implica que el ítem tenga niveles. Deja de depender de la configuración del ítem. Una oferta nueva arranca en 1.
2. **Colores del kit.** `icon_variant` es uno de los seis ids de `ItemIconVariant` del kit: `default`, `azure`, `amethyst`, `amber`, `emerald`, `crimson`. El kit no cambia.
   - El backend acepta los seis para cualquier tipo de ítem.
   - El frontend oculta el que repite el dibujo clásico de cada tipo (escudo `azure`, vida `crimson`, boost de XP `amethyst`, boost de monedas `amber`), así el profesor ve 5 opciones por tipo.
3. **Contrato REST** (`snake_case`), en la oferta de `/api/market/courses/{courseId}/catalog/manage`:
   - `icon_shape` (entero) e `icon_variant` (texto) viajan al publicar (`POST`) y al editar (`PATCH /{offerId}`), y salen en las respuestas de la oferta.
   - Al publicar son opcionales: si faltan, se guardan `1` y `default`.
   - Al editar, si faltan, se conservan los guardados.
   - Se pueden editar siempre, aunque la oferta tenga ventas.
   - Respuesta 400 nombrando el campo si `icon_shape` está fuera del rango de su tipo o si `icon_variant` no es uno de los seis.
4. **Migración de las ofertas existentes.** Una migración Flyway nueva les asigna la forma que hoy calcula el frontend (escudo = cargas con tope 4; vida = vidas con tope 3; boosts: multiplicador hasta 1.25 → 1, hasta 1.75 → 2, el resto 3) y el color `default`. Así ninguna oferta cambia de aspecto al desplegar.
5. **Copias en columnas propias.** Las [[Orden de compra|órdenes]], las [[Meta colectiva|metas colectivas]] (en columnas, no dentro de `item_configuration`), el snapshot de la [[Subasta]] (`AuctionItemSnapshot`) y los premios de cofre copian forma y color de la oferta de origen al crearse. Editar la oferta después no cambia lo copiado. Los premios de cofre (`ChestRewardEntity`) embeben el mismo `AuctionItemSnapshot`, así que heredan sus columnas.
6. **`ITEM_CONFIRMED` con ícono, apagado.** El evento en `market.events` suma `icon_shape` e `icon_variant` como campos aditivos, sin cambiar `event_version` (sigue en 1). Se emiten solo con la propiedad `market.events.item-confirmed.icon.enabled`, que arranca en `false`. Se prende cuando Accounting confirme que los acepta, en una issue de `tpi-accounting` que todavía no está abierta.
7. **`StorefrontOfferDto.icon` queda deprecado.** Sigue saliendo con el texto fijo de `resolveIcon` para no romper a quien lo lea, pero el ícono real es `icon_shape` + `icon_variant`.

## Alternativas descartadas
- **Quitar el selector de color y dejar solo la forma automática:** resuelve la inconsistencia, pero le saca al profesor una elección que ya ve en pantalla, y la forma seguiría cambiando con cada ajuste de la configuración.
- **Guardar el ícono dentro de `custom_description`:** mezcla presentación con texto libre, no se puede validar y obliga a parsear la descripción en cada cliente.
- **Ocho paletas propias del frontend** (las de `item-icon-variants.ts`): Accounting no las conocería sin compartirlas por fuera del kit, o habría que extender el kit; los seis ids de `ItemIconVariant` ya existen y los dibuja `GenericItemIcon`.

## Consecuencias
- **Oferta (T02 `#13384`):** columnas nuevas en `course_catalog_offers`, validación por tipo en publicar y editar, campos en `CatalogOfferPublishDto`, `CatalogOfferUpdateDto` y las respuestas, y la migración Flyway de la decisión 4. El número de versión se elige al implementar (hoy `develop` llega a `V26`).
- **Copias (T03 `#13385`):** columnas nuevas en `orders`, `goals`, el snapshot de subastas y los premios de cofre, completadas desde la oferta de origen. Qué valor reciben las copias que ya existen (órdenes, metas, subastas y premios creados antes) no está decidido acá: se resuelve en esa task.
- **Accounting (T04 `#13386`):** los tres productores de `ITEM_CONFIRMED` (`ItemProvisionDispatcher`, `GoalItemDeliveryDispatcher`, `AuctionItemDeliveryDispatcher`) suman los dos campos detrás de la propiedad. Hace falta abrir la issue en `tpi-accounting`; mientras tanto el evento sale como hoy ([[Integración con Accounting]]).
- **Frontend (T05 `#13387`):** el formulario manda `icon_shape` e `icon_variant`, el selector usa `variant` del kit con 5 opciones por tipo y las vistas dibujan el ícono guardado en lugar de `spriteTier`.
- La [[Plantilla base]] conserva su `icon` de texto; esta decisión no lo toca.
- Los efectos del ítem no cambian: el ícono es solo presentación ([[DEC-010 - Los efectos de los ítems no son de Mercado]]).

## Notas afectadas
[[Oferta de catálogo]], [[Orden de compra]], [[Meta colectiva]], [[Subasta]], [[Integración con Accounting]], [[Decisiones - Índice]].
