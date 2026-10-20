---
tipo: decision
estado: vigente
verificado_contra: DEC-036
actualizado: 2026-10-17
tags: [mercado, decision, oferta, publicacion, cohorte, cursos]
---
# DEC-036 - Duración de publicación de ofertas

> La publicación de una oferta se configura como duración en días, horas y minutos (`publication_duration_minutes`), empieza a correr al activarla, se pausa al desactivarla, vence de forma definitiva y nunca supera el fin de la cohorte (`end_date` + 1 día a las 00:00 de Buenos Aires). Los ítems comprados siguen sin vigencia.

## Contexto

En `develop` el vencimiento de la publicación se calculaba desde la creación, la oferta nacía activa y no se guardaban ni la duración configurada ni el saldo pausado. El frontend creaba una oferta inactiva publicándola y pausándola después, con lo que quedaba activa un instante y consumía plazo. Extender la fecha reactivaba una oferta vencida.

Origen sin pregunta `Q-NNN`: US #9323 / Task #9331 de Taiga. Plan de publicación de ofertas, revisión 1, aprobado por el responsable de la tarea el 2026-10-16, con las decisiones 1 a 19 y los pendientes resueltos el 2026-10-16 y el 2026-10-17 en Orca. Se apoya en [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] y [[DEC-013 - Reglas de la tienda]], y en la decisión de ítems sin vigencia después de la compra que propone la PR #49 del vault (abierta; numerada DEC-029 en su rama, con el número DEC-030 reservado para ella).

## Decisión

### Duración y contrato HTTP

- El profesor ingresa la duración con tres campos de teclado: días, horas (0–23) y minutos (0–59). Solo se admiten enteros no negativos; un campo vacío vale cero; un día son 24 horas exactas. No hay selector de unidad.
- El contrato usa un único campo, `publication_duration_minutes`: entero estricto; 0, `null` u omitido significa "hasta el fin de la cohorte" (sin plazo propio); el mínimo positivo es 1 minuto y el máximo es el tiempo que falta hasta el corte de la cohorte.
- Publicar acepta `active` y crea la oferta inactiva en una sola transacción. Una oferta inactiva no consume plazo: la duración empieza al activarla.
- Desactivar pausa el saldo; reactivar continúa con ese saldo. Pausar o activar desde la gestión nunca reinicia ni extiende.
- Editar acepta `restart_publication`: cambiar la duración siempre reinicia con el valor nuevo; `true` reinicia la misma duración; ausente o `false` conserva el saldo. Si la oferta queda inactiva, el reloj corre recién al activarla.
- `publication_ttl_minutes` y `publication_expires_at` dejan de aceptarse como entrada y responden 400. `publication_expires_at` sigue en las respuestas como vencimiento calculado. La respuesta de gestión agrega `publication_duration_minutes`, `publication_remaining_minutes` y `publication_expired_at`.
- El vencimiento es definitivo: una oferta vencida no revive por edición, cambio de duración ni reactivación. Para volver a ofrecerla se publica otra oferta.
- Si al reactivar el saldo supera el tiempo restante de la cohorte, o queda menos de un minuto, se rechaza la activación con 400 `offer-update-not-allowed` y se pide ajustar la duración. No se recorta el saldo ni se activa parcialmente.
- Los ítems comprados siguen sin vigencia ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] y la decisión de la PR #49 no cambian). No se reintroduce `itemValidityDays` ni se confunde con la duración del efecto de un boost.

### Corte de cohorte

- El `end_date` de la cohorte es inclusivo. El corte es exclusivo, a las 00:00 del día siguiente en `America/Argentina/Buenos_Aires`; el último minuto disponible es 23:59. La zona se aplica solo al corte civil; las duraciones son tiempo transcurrido exacto.
- Ninguna oferta sigue disponible después del corte: nuevas, existentes, pausadas, reiniciadas, reactivadas y sin plazo propio. El fin de cohorte vence de forma definitiva también las pausadas con saldo.
- Decisión 17 (cambio de `end_date` en Cursos): cada oferta guarda el corte vigente al configurarla y el límite efectivo es el menor entre ese corte guardado y el fin actual que devuelve Cursos. Si Cursos adelanta el fin, el corte nuevo rige de inmediato al consultar la cohorte con `GET /course-cohorts/{id}`. Si lo extiende, las ofertas vigentes conservan su límite hasta que el profesor guarda una edición desde el formulario; las vencidas siguen vencidas.
- Decisión 18: una oferta sin duración propia (fecha fija heredada o "hasta fin de cohorte") no admite reinicio. El formulario no muestra la pregunta y el backend rechaza `restart_publication: true` con 400 `offer-update-not-allowed`. Para dar más tiempo se cambia la duración.
- Ofertas existentes: no se inventa una duración a partir de `createdAt` o `updatedAt`. Activa con fecha futura: conserva la fecha como vencimiento fijo y, al pausarla, congela el saldo. Inactiva con fecha futura: saldo congelado igual a la fecha menos el momento de la migración, que corre al activarla. Fecha pasada: vencida definitiva. Sin fecha: hasta fin de cohorte. La migración `V7__offer_publication_duration.sql` es solo aditiva (cinco columnas nulables y dos `CHECK`; era V6 y se renumeró a V7 porque `develop` ya tiene `V6__goal_notifications.sql`), sin borrar ni reescribir datos.

### Llamadas a Cursos (decisión 19)

- Excepción acotada a la regla de US-7362 "una sola llamada a Cursos por request" (AC-5 en `CourseMarketSingleCursosCallAcceptanceTest`). Las escrituras de gestión (publicar, editar y cambiar estado), la tienda (listado y detalle) y la creación de órdenes hacen dos llamadas por request: membresía (`/course-cohorts/{id}/membership`) y detalle de cohorte (`/course-cohorts/{id}`), cada una cacheada solo dentro del request.
- Motivo: la membresía no expone `end_date` y el detalle de cohorte no expone el rol; unificarlas exige cambiar Cursos, fuera de alcance. La decisión 17 obliga a consultar el fin vigente en cada operación para que ninguna venta siga activa tras un adelanto.
- El listado de gestión, los resúmenes y los avisos no consultan la cohorte y usan los datos guardados. El resto de US-7362 no cambia ([[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]]).
- La excepción quedó comentada en Taiga el 2026-10-17, en US #9323 y en US-7362 (verificado en el historial de ambas historias).

### Fallas de Cursos

- Se falla cerrado, nunca como publicación ilimitada. Cursos caído, rechazo del gateway o de permisos, o respuesta sin `end_date` o con formato inválido: 503 `course-service-unavailable` al crear, activar, editar, en la tienda y en la compra, sin persistencia ni eventos.
- Cohorte inexistente (404) o no activa: mercado deshabilitado con 403 `COURSE_MARKET_DISABLED`, como fija [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]].
- Los detalles de error del backend están en español formal (usted), por ejemplo «Una oferta vencida no puede reactivarse; publique una nueva oferta». El frontend los muestra sin cambios en el toast existente.

### Frontend

- Diseño aprobado el 2026-10-16 en el canvas de Orca: tableros 1, 2 y 3 (pregunta de reinicio en línea, solo con cambios reales); la alternativa modal 3b se rechazó; el tablero 4 deja la gestión sin cambios visuales salvo el detalle del error. El 2026-10-17 se aprobaron los tableros 5 y 5b: el paso "Precio y publicación" sin scroll de página en 1366×768, con reflujo en pantallas angostas.
- El formulario muestra siempre el corte de la cohorte y el tiempo restante, rechaza al escribir o pegar entradas inválidas conservando el valor anterior, revalida al guardar y deshabilita la duración en ofertas vencidas o con menos de un minuto de cohorte. Los datos que no se pueden cambiar en edición se muestran como mecánicas bloqueadas.
- Textos en `src/assets/i18n/es.json` y `en.json`; el español del formulario sigue el voseo existente del marketplace.
- Dos carencias del UI Kit `@2026-p4-fe/ui` 0.9.0 se publicaron como issues el 2026-10-17, a pedido del responsable de la tarea: [orientación horizontal de `GenericRadioGroup` (#152)](https://github.com/2026-P4-FE/2026-PIV-TPI-UI-KIT/issues/152) y [`ariaDescribedBy` externo en `GenericInput` (#153)](https://github.com/2026-P4-FE/2026-PIV-TPI-UI-KIT/issues/153). La #153 es distinta de la #147, que pide prefijo, unidad, `ariaLabel` y `focus()` en el mismo componente. Mientras tanto el frontend mantiene las opciones de reinicio en vertical y el enlace de error por input, marcados en el código con `ui-kit#152` y `ui-kit#153`.

## Alternativas descartadas

- **Selector de unidad o un solo campo en días:** el responsable eligió tres campos de teclado.
- **Fecha absoluta o TTL como entrada:** se reemplazan por la duración; aceptarlos permitiría eludir el corte de cohorte. Sustituye el contrato de extensión por fecha de la T6 de [[DEC-013 - Reglas de la tienda]].
- **Recortar el saldo o activar parcialmente al superar el fin de cohorte:** se rechaza y se pide ajuste explícito.
- **Extender automáticamente las ofertas cuando Cursos extiende la cohorte:** solo una edición explícita del profesor toma el fin nuevo.
- **Una sola llamada a Cursos:** exige cambiar el contrato de Cursos, fuera de alcance.
- **Tratar la falla de Cursos como publicación sin límite:** se falla cerrado.

## Consecuencias

- Backend (`tpi-market`, rama `feature/tema-09-offer-publication-duration`, PR [#230](https://github.com/2026-P4-BE/tpi-market/pull/230) sin merge, al día con `develop`): migración V7, campos nuevos en `entities/CourseCatalogOfferEntity.java`, `OfferPublicationPolicy`, `OfferPublicationAvailability`, `OfferPublicationEditor`, `CohortCutoffResolver`, `CourseCohortClient.findCohortEndDate`, DTO de publicación y edición, `GlobalExceptionHandler` y `docs/api_doc/swagger.json`.
- Frontend (`2026-PIV-TPI-FE`, rama `feature/tema-09-offer-publication-duration`, PR [#698](https://github.com/2026-P4-FE/2026-PIV-TPI-FE/pull/698) sin merge): `src/app/features/marketplace/**` e i18n.
- No cambian Cursos, Accounting, el UI Kit, los contratos con otros servicios ni el reloj global (`ClockConfig`).

## Evidencia y pendientes (2026-10-17)

- Backend: `mvnw -B verify` BUILD SUCCESS con 4370 tests, 0 fallas, 17 omitidos que requieren Docker, Checkstyle y PMD limpios; `mvnw -B javadoc:javadoc` BUILD SUCCESS. Las pruebas de integración usan un Cursos simulado (mock), no el servicio real.
- Frontend: `npm run verify` exit 0, con 10.046 tests aprobados, 1 falla esperada y 3 TODO (10.050 en total); sin `ng build` local.
- Pendiente: prueba de punta a punta contra Cursos real (no hay E2E: todo lo anterior usa mocks), QA en navegador del ajuste sin scroll y de accesibilidad (teclado, NVDA, zoom 200 %, 320 px, temas), ejecución de V7 en un entorno desplegado (en local corrió sobre PostgreSQL con Testcontainers: `verify` con 5735 tests, 0 fallas y 0 omitidos) y zona horaria del despliegue sin verificar. PR abiertas sin merge ni despliegue.

## Notas afectadas

[[Oferta de catálogo]], [[DEC-013 - Reglas de la tienda]], [[Decisiones - Índice]].
