---
tipo: estado
estado: vigente
verificado_contra: codigo@b8aa60e6
actualizado: 2026-10-15
tags: [mercado, fix, oferta, precio, validacion, preview]
---
# Fix - Límite del precio de oferta y preview

> Implementación local del precio entero entre 1 y 999999 y de la preview con «Precio pendiente», conforme a [[DEC-028 - Precio de oferta hasta 999.999 monedas]]. Backend y frontend tienen verificaciones locales satisfactorias; la QA manual sigue en curso y no hubo publicación, merge ni despliegue.

## Origen y alcance de la evidencia

Plan de precio P2 aprobado el 2026-10-14 y refinamientos humanos del 2026-10-14/15. Los commits, resultados y estados siguientes fueron verificados y comunicados por el coordinador para este registro del 2026-10-15; esta nota no presenta esas suites como ejecutadas por el worker del vault.

Ambos repositorios usan la rama local `fix/tema-09-offer-price-max-999999`: backend desde `develop@8303981c` y frontend desde `develop@8a770d50`. El fix del nombre tiene seguimiento independiente en [[Fix - Límite del nombre de oferta y preview]].

## Implementación local

### Backend — `tpi-market`

- `b8aa60e6` (`fix(catalog): cap offer coin price at 999999 with strict integer parsing`), seguido de `94c94c28`, `a3b815da` (snapshot OpenAPI propio) y `10d38e3c` (evidencia ODD).
- `entities/CourseCatalogOfferEntity.java`: constante `MAX_COIN_PRICE = 999_999`.
- `dtos/manage/CatalogOfferPublishDto.java` y `dtos/manage/CatalogOfferUpdateDto.java`: `@Max` y `StrictCoinPriceDeserializer` aplican el máximo y la conversión estricta de `coin_price`. El rechazo responde 400 `validation-error`, campo `coinPrice`.
- Precio omitido o `null` conserva el guardado. Enviar uno superior al máximo se rechaza aunque sea igual al guardado. Se conservan los precios antiguos intactos sin migración ni recorte, según [[DEC-028 - Precio de oferta hasta 999.999 monedas]].

### Frontend — `2026-PIV-TPI-FE`

- `7395a8e8` (F1), `7d256ff3` (F1b), `c2c9ff80` (F1c) y commits de evidencia ODD hasta `3832a180`, en el formulario `offer-form.component.ts`.
- Valida el precio como texto y rechaza inserciones inválidas completas. Ayuda: «Entre 1 - 999.999 monedas. Ingresá el valor sin puntos ni comas». Aviso en el máximo: «Llegaste al máximo de 999.999 monedas».
- El error rojo reemplaza la ayuda: «No están permitidos caracteres especiales» o «999.999 Max». Los caracteres especiales tienen prioridad si concurren ambas causas.
- Omite el precio antiguo intacto del `PATCH`. La preview usa `GenericOfferCard` para precio válido o antiguo y `GenericCard` con «Precio pendiente» para entrada inválida.
- Por elección humana, el precio válido conserva el renderizado del UI Kit sin separador de miles (`999999`), igual que la vitrina.

## Verificación y revisión

| Frente | Evidencia local comunicada por el coordinador |
|---|---|
| Backend | Fase RED: 22 fallas de 84 pruebas. `./mvnw -B verify`: 3427 pruebas, 0 fallas; Checkstyle y PMD OK. JavaDoc OK y comprobación puntual del coordinador OK. |
| Frontend | `npm run verify`: exit 0, 8753 pruebas, con `VITEST_MAX_WORKERS=4` limitado al proceso. Comprobación puntual del coordinador: 150/150. |
| RDD backend | Riesgo medio, por debajo del presupuesto; revisión pendiente en la porción de trabajo. |
| RDD frontend F1 | Riesgo alto; consentimiento humano, revisión con cuatro lentes, 0 hallazgos, aprobada y reconocida. |
| RDD frontend F1b y F1c | Riesgo medio, por debajo del presupuesto; revisión pendiente en la porción de trabajo. |

## Estado de entrega y pendientes

- **Implementado localmente:** backend y frontend en los commits anteriores.
- **Aceptación humana parcial:** opción 1 de preview, renderizado sin separadores, error rojo y textos por causa; F1b y F1c aceptados. Las skills adicionales usadas por el worker del frontend fueron aceptadas después de su uso.
- **QA manual:** en curso con el humano sobre el frontend local; no se registra como aprobada ni completa.
- **Integración real frontend/backend B1:** pendiente; requiere primero integrar B1 mediante merge. Las pruebas locales no acreditan esa integración.
- **Publicado / integrado / desplegado:** sin push, sin PR, sin merge y sin despliegue de este fix. Sin aceptación en producción. CI remoto bloqueado por facturación.
- **Seguimiento del UI Kit, sin registrar todavía:** `GenericOfferCard` de `@2026-p4-fe/ui` 0.7.1 exige `price` numérico, lo renderiza sin formato y no ofrece un espacio para precio pendiente. No se modifica el UI Kit en este alcance.

## Relacionado

[[Oferta de catálogo]], [[DEC-028 - Precio de oferta hasta 999.999 monedas]], [[Decisiones - Índice]].
