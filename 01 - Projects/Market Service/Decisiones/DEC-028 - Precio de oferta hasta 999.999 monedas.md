---
tipo: decision
estado: vigente
verificado_contra: DEC-028
actualizado: 2026-10-15
tags: [mercado, decision, oferta, precio, validacion, preview]
---
# DEC-028 - Precio de oferta hasta 999.999 monedas

> El precio de una oferta debe ser un entero entre 1 y 999999, inclusive, al crearla o cambiar su precio. Los precios antiguos superiores se conservan hasta cambiarlos; la preview muestra «Precio pendiente» cuando la entrada es inválida.

## Contexto

El formulario de precio necesitaba un máximo de negocio y una validación que no transformara entradas inválidas en otro importe. También era necesario evitar que la preview mostrara cero como sustituto de una entrada inválida. La API debe aplicar el límite aunque se la invoque directamente.

Origen sin pregunta `Q-NNN`: plan de validaciones y máximos de Mercado (Tema 09), Campo 2 (precio), revisión P2, aprobado por el product owner el 2026-10-14 con «confirmo el plan», y refinamientos del product owner del 2026-10-14/15. Evidencia de ejecución y alcance de la verificación en [[Fix - Límite del precio de oferta y preview]].

## Decisión

- Al crear una oferta o cambiar su precio, admitir únicamente enteros entre 1 y 999999, inclusive, en frontend y backend. La conversión estricta del backend se limita a `coin_price`: rechaza fracciones, exponentes, cadenas, booleanos y overflow con 400, sin coerción ni persistencia parcial.
- Conservar los precios antiguos superiores sin migrarlos ni recortarlos. Editar otros campos o cambiar el estado no obliga a corregirlos. En edición, precio omitido o `null` conserva el guardado; enviar uno superior al máximo se rechaza incluso si coincide con el actual.
- Validar el texto antes de convertirlo. Rechazar por completo una inserción que produzca caracteres no numéricos o más de seis dígitos, conservando el valor anterior. Los ceros iniciales cuentan como posiciones. Vacío o cero pueden existir durante la edición, pero impiden guardar.
- Permitir borrar o reemplazar un precio antiguo para corregirlo; el nuevo precio debe cumplir el rango. Volver al original restablece la excepción y el frontend omite `coinPrice` del `PATCH` mientras siga intacto.
- Ayuda: «Entre 1 - 999.999 monedas. Ingresá el valor sin puntos ni comas». En 999999, aviso «Llegaste al máximo de 999.999 monedas», sin bloquear el envío; desaparece al bajar y no se muestra para un precio antiguo exento.
- Un rechazo se muestra como error rojo del campo y reemplaza la ayuda, siguiendo el criterio del nombre en [[Fix - Límite del nombre de oferta y preview]]. Texto por causa: «No están permitidos caracteres especiales» o «999.999 Max»; si concurren ambas, prevalecen los caracteres especiales.
- Preview: opción 1 elegida por el product owner a partir del mockup. Usar `GenericOfferCard` para el precio válido o antiguo intacto y `GenericCard` con «Precio pendiente» para entrada inválida. El precio válido conserva el renderizado numérico del UI Kit, sin separador de miles (`999999`), como la vitrina; este refinamiento reemplaza la propuesta inicial de formato localizado de P2.

## Alternativas descartadas

- **Precio sin máximo o validado solo por la interfaz:** el product owner eligió 999999 y pidió que la API también impidiera excederlo.
- **Migrar, recortar o exigir corregir precios antiguos para editar otros campos:** contradice la conservación explícita de esos precios hasta cambiarlos.
- **Eliminar caracteres o convertir signos, decimales y exponentes en otro importe:** altera la intención de quien ingresa el precio.
- **Cero como fallback de preview:** representa un precio que no se ingresó; se eligió «Precio pendiente».
- **Formato con separador de miles en la card:** el refinamiento del product owner conserva el renderizado del UI Kit y la vitrina.

## Consecuencias

Cambian validaciones, conversión de `coin_price`, payload de edición, mensajes y preview. No cambian campos, tipos, endpoints, Jackson global, contratos de otros servicios, reservas, cobros ni precios históricos de órdenes. Los precios de plantillas y subastas quedan fuera del alcance; un default de plantilla fuera de rango se muestra inválido al crear, sin corregirlo automáticamente. Conservar un precio antiguo no introduce un bloqueo de compra.

Estado al 2026-10-15: implementada y mergeada en `develop` en backend (`tpi-market@ac05a77f`, PR #194) y frontend (`2026-PIV-TPI-FE@23c41687`, PR #580), con la QA manual del frontend aprobada. Quedan pendientes la prueba de punta a punta contra el backend de `develop` y el despliegue; el detalle está en [[Fix - Límite del precio de oferta y preview]].

## Notas afectadas

[[Oferta de catálogo]], [[Fix - Límite del precio de oferta y preview]], [[Decisiones - Índice]], [[S2-03 - Reglas de la tienda]], [[S2-OPC2 - Frontend de gestión del profesor]].
