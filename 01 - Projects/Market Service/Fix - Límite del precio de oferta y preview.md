---
tipo: estado
estado: vigente
verificado_contra: codigo@ac05a77f
actualizado: 2026-10-15
tags: [mercado, fix, oferta, precio, validacion, preview]
---
# Fix - Límite del precio de oferta y preview

> Fix mergeado en `develop` el 2026-10-15 en backend ([tpi-market #194](https://github.com/2026-P4-BE/tpi-market/pull/194), merge `ac05a77f`) y frontend ([2026-PIV-TPI-FE #580](https://github.com/2026-P4-FE/2026-PIV-TPI-FE/pull/580), merge `23c41687`): precio entero entre 1 y 999999 y preview con «Precio pendiente», conforme a [[DEC-028 - Precio de oferta hasta 999.999 monedas]]. La QA manual del frontend fue aprobada; quedan pendientes la prueba de punta a punta contra el backend de `develop` y el despliegue.

## Origen

Plan de validaciones y máximos de Mercado (G11, Tema 09), Campo 2 (precio), revisión P2, aprobado por el product owner el 2026-10-14, con refinamientos del 2026-10-14/15. No hay tarea dedicada en Taiga. El fix del nombre tiene seguimiento independiente en [[Fix - Límite del nombre de oferta y preview]] y se integró en ambas ramas antes del merge.

Ambos repositorios usaron la rama `fix/tema-09-offer-price-max-999999`: backend desde `develop@8303981c` y frontend desde `develop@8a770d50`.

## Implementación (mergeada en `develop`)

### Backend — `tpi-market`

- Commits del fix: `b8aa60e6` (`fix(catalog): cap offer coin price at 999999 with strict integer parsing`), `94c94c28` y `a3b815da` (contrato OpenAPI). El resto de la rama es documentación de la tarea, Javadoc regenerado y la integración de `develop` con el fix del nombre (`7cbb12e7`). Último commit: `c2d52c72`; merge en `develop`: `ac05a77f`.
- `entities/CourseCatalogOfferEntity.java`: constante `MAX_COIN_PRICE = 999_999`.
- `dtos/manage/CatalogOfferPublishDto.java` y `dtos/manage/CatalogOfferUpdateDto.java`: `@Max(MAX_COIN_PRICE)` con el mensaje «El precio no puede superar las 999.999 monedas.» y `dtos/manage/StrictCoinPriceDeserializer.java` para la conversión estricta de `coin_price`. `controllers/GlobalExceptionHandler.java` traduce el rechazo de conversión a 400 `validation-error`, campo `coinPrice`.
- `docs/api_doc/swagger.json`: `coin_price` gana `minimum: 1` y `maximum: 999999` en los dos DTO de request; no cambian campos ni endpoints.
- Precio omitido o `null` conserva el guardado. Enviar uno superior al máximo se rechaza aunque sea igual al guardado. Los precios antiguos se conservan intactos, sin migración ni recorte.

### Frontend — `2026-PIV-TPI-FE`

- Commits del fix en `offer-form.component.ts`: `7395a8e8`, `7d256ff3`, `c2c9ff80` y `64f6efae` (compatibilidad con el UI Kit 0.8.0). La rama integró `develop` en `87ebe893`, con el fix del nombre y `@2026-p4-fe/ui` 0.8.0. Último commit: `c2fb29aa`; merge en `develop`: `23c41687`.
- Valida el precio como texto y rechaza inserciones inválidas completas. Ayuda: «Entre 1 - 999.999 monedas. Ingresá el valor sin puntos ni comas». Aviso en el máximo: «Llegaste al máximo de 999.999 monedas».
- El error rojo reemplaza la ayuda: «No están permitidos caracteres especiales» o «999.999 Max». Los caracteres especiales tienen prioridad si concurren ambas causas. `GenericInput` 0.8.0 muestra la ayuda y el error a la vez; `64f6efae` vacía la ayuda mientras hay error para conservar ese comportamiento.
- Omite el precio antiguo intacto del `PATCH`, también al cambiar el estado. La preview usa `GenericOfferCard` para precio válido o antiguo y `GenericCard` con «Precio pendiente» para entrada inválida.
- El precio válido conserva el renderizado del UI Kit sin separador de miles (`999999`), igual que la vitrina.

## Verificación

| Frente | Evidencia |
|---|---|
| Backend | Tras integrar `develop`: `./mvnw -B verify`, 3445 pruebas, 0 fallas, 11 omitidas; Checkstyle y PMD OK. Revisión de código sin hallazgos y PR aprobado. |
| Frontend | Tras integrar `develop` y el UI Kit 0.8.0: `npm run verify`, exit 0, 8776 pruebas aprobadas. QA manual en navegador aprobada el 2026-10-15 sobre el frontend local. PR aprobado. |
| CI remoto | Los checks `test` (backend) y `verify` (frontend) fallan en 2 s por el bloqueo de facturación de GitHub Actions, no por el código. Los dos PR se mergearon con esa evidencia local. |

## Estado de entrega y pendientes

- **Mergeado en `develop`:** backend y frontend, el 2026-10-15.
- **Prueba de punta a punta:** pendiente. La QA manual se hizo antes del merge del backend; falta probar el frontend contra el backend de `develop`.
- **Despliegue y aceptación en producción:** sin registro.
- **CI remoto:** no corrió por facturación; conviene volver a correrlo cuando se resuelva.
- **Seguimiento del UI Kit, sin registrar todavía:** `GenericOfferCard` de `@2026-p4-fe/ui` 0.8.0 sigue exigiendo `price` numérico, lo renderiza sin formato y no ofrece un espacio para precio pendiente. No se modificó el UI Kit en este alcance.

## Relacionado

[[Oferta de catálogo]], [[DEC-028 - Precio de oferta hasta 999.999 monedas]], [[Decisiones - Índice]].
