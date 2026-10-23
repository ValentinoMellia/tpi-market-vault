---
tipo: decision
estado: vigente
verificado_contra: codigo@e63dcb47
actualizado: 2026-10-23
tags: [mercado, decision, cofres, edicion]
---
# DEC-041 - Edición de un cofre según su estado

> Un cofre en borrador se edita completo. Uno publicado o desactivado solo cambia nombre, descripción, precio, «mostrar probabilidades» y límite por alumno: los pesos y los premios quedan fijos. Al editar, los premios que siguen apuntando a la misma oferta conservan su copia, y solo se copian las ofertas nuevas.

## Contexto
[[DEC-032 - Sorteo y reglas de configuración de los cofres]] decidió que cada premio guarda una copia congelada de la oferta, pero no dijo qué se puede editar de un cofre ya publicado. Tampoco dijo cómo se conserva esa copia cuando la edición es un PUT completo. Si cada edición volviera a copiar el estado actual de la oferta, la copia dejaría de estar congelada. El QA de la T04 (#12008) lo dejó como punto a decidir para la T05.

El equipo de Mercado (Patricio Fernandez) lo decidió el 2026-10-22, al cerrar la exploración de la T05 (#12009, servicio de gestión, change `us-12002-t05-chest-manage-service` y PR 270 de `tpi-market`).

## Decisión
- **Borrador (`DRAFT`): se edita todo.**
- **Publicado o desactivado: solo nombre, descripción, precio, `show_probabilities` y límite por alumno.** Es el mismo criterio que una oferta activa o inactiva. Los pesos y los premios no se editan, porque son lo que el alumno compra y sus chances.
  - Un PUT que los cambia responde 409 `chest-state-conflict` con el campo (`rarity_weights` o `prizes`).
  - Mandarlos iguales se acepta.
- **Conservar la copia al editar.** Cada premio pedido toma el primer premio guardado, sin usar, de la misma oferta (`source_offer_id`), sin importar la posición.
  - Conserva su copia y su `item_value`; solo cambian la posición y la rareza.
  - Los premios guardados que sobran quedan con `deleted = true`, no se borran.
  - Solo las ofertas nuevas se copian.
- **Transiciones.**
  - `DRAFT` pasa a `PUBLISHED`, y `PUBLISHED` y `DEACTIVATED` van y vuelven (la reactivación se permite, como en las ofertas).
  - Un borrador se puede descartar con un borrado lógico del cofre y sus premios, como el `discard` de las metas. Después responde 404.
- **Publicar o reactivar** exige que el cofre se pueda sortear: al menos un premio y alguna rareza con premios y con peso. No vuelve a leer las ofertas.
- **Versión.** La edición exige `version`: sin ella responde 400, y con una versión vieja 409 `chest-version-conflict`. Publicar, desactivar, reactivar y descartar no la piden.

## Alternativas descartadas
- **Editar todo en cualquier estado:** un alumno podría comprar con unas probabilidades y recibir el premio con otras.
- **Volver a copiar todas las ofertas en cada edición:** rompe la copia congelada de DEC-032. Un cambio de precio o de cargas en la oferta se colaría en un cofre ya armado.
- **Emparejar los premios por posición:** reordenar los premios haría perder la copia.
- **Pedir `version` también al publicar, desactivar y descartar:** Patiño lo sugirió en la review de la PR 270 y no se adoptó en la US-12002. Queda como pendiente en [[Cofre]].

## Consecuencias
- **Código.** El estado lo controla `services/impl/ChestEditGuard.java`, el emparejamiento `services/impl/ChestPrizeMerger.java` y las transiciones `services/impl/ChestManageServiceImpl.java`, todo bajo `src/main/java/ar/edu/utn/frc/tup/p4/`.
- **PUT completo.** Omitir `show_probabilities`, `purchase_limit` o `rarity_weights` los vuelve al valor por defecto. En un cofre publicado con pesos propios, omitir `rarity_weights` responde 409, porque cambiaría los pesos. Está documentado en la descripción de OpenAPI del PUT.
- **US-12003 y US-12004.** El alumno solo ve cofres `PUBLISHED` no descartados. Los premios con `deleted = true` se conservan para las órdenes que los sortearon.
- **Pendientes registrados en [[Cofre]]:**
  - Sin `version`, una vista vieja puede publicar un borrador recién editado.
  - Si la publicación pierde una carrera contra una edición, responde 409 `chest-version-conflict`.

## Notas afectadas
[[Cofre]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[S3-02 - Cofres, el profesor crea y gestiona]], [[Decisiones - Índice]].
