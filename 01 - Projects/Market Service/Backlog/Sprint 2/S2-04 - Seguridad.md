---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-04
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5214"
puntos: 3
prioridad: Should
horas: 16
---
# S2-04 - Seguridad

> Endurecer la autorización de Mercado: parseo exacto de roles, sin bypass por cabecera vacía y sin usuario por defecto. Cierra los gaps 9 y 12 que dejó [[DEC-006 - Roles y permisos según el código y los headers del gateway]]. 4 tareas, 16 h, 3 puntos, Should.

## [G11] — Seguridad

---

## Descripción (Como / Quiero / Para)

- **Como**: administrador de la plataforma
- **Quiero**: que Mercado valide los roles y la identidad de forma estricta
- **Para**: que nadie opere con permisos que no tiene ni con la identidad de otro usuario

---

## Notas / Observaciones

- [ ] Reglas de negocio: la cabecera oficial de roles es X-User-Roles; los roles son STUDENT, PROFESSOR, ADMIN, GESTOR y MS ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]). Se quita el respaldo X-Roles.
- [ ] Validaciones: comparación exacta de cada rol de la cabecera (separada por comas), sin contains(): hoy rolesHeader.contains("MS") también acepta cualquier valor que contenga MS, y contains("ADMIN") acepta NOT_ADMIN (services/impl/CourseCatalogManageServiceImpl.java, líneas 162 a 189 y 343 a 348).
- [ ] Datos obligatorios: X-User-Id y X-User-Roles en toda ruta autenticada; si falta X-User-Id la respuesta es 400 missing-header o 401, no un usuario por defecto.
- [ ] Performance (tiempos, volumen, límites): sin impacto.
- [ ] Seguridad (roles, permisos, datos sensibles): GatewayIdentityFilter sigue confiando en las cabeceras del gateway sin validar JWT ([[Gateway e identidad]]); validar JWT queda fuera de alcance. validateProfessorAccess hoy omite el chequeo cuando la cabecera está vacía. Los controladores asumen usr-student-001 si falta X-User-Id (StorefrontCatalogController, StudentOrderController, CatalogOfferController).
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: el código de estado exacto cuando falta la identidad (400 o 401) se confirma con el equipo al inicio de la tarea 3.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: una cabecera X-User-Roles con un valor que solo contiene un rol como subcadena (por ejemplo NOT_ADMIN o SYSTEM) no otorga ADMIN ni MS; verificado con pruebas parametrizadas.
- [ ] **CA2**: PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status con X-User-Roles vacío o ausente responde 403 y no ejecuta la verificación de profesor como "omitida".
- [ ] **CA3**: ninguna ruta de /api/market/** asume usr-student-001; sin X-User-Id responde con error y la cadena no aparece en el código de producción.
- [ ] **CA4**: no hay referencias a la cabecera X-Roles en GatewayIdentityFilter ni en los controladores.
- [ ] **Extras (opcional)**: una prueba de seguridad por cada rol y endpoint de la tabla de [[Estado actual del código]].

---

## BDD (mínimo 3 escenarios)

**Característica:** Autorización estricta por roles e identidad

**Escenario 1**  

- **Dado**: un usuario con `X-User-Roles: NOT_ADMIN`
- **Cuando**: llama a `PATCH /api/market/offers/{id}/status` con `{"active": false}`
- **Entonces**: responde 403 `access-denied` y la oferta no cambia

**Escenario 2**  

- **Dado**: una petición sin `X-User-Roles` ni `X-Roles`
- **Cuando**: se llama a `POST /api/market/courses/{courseId}/catalog/manage`
- **Entonces**: responde 403 y no se consulta ni se crea ninguna oferta

**Escenario 3**  

- **Dado**: una petición sin la cabecera `X-User-Id`
- **Cuando**: se llama a `GET /api/market/orders?courseId={courseId}&page=0&size=10`
- **Entonces**: responde con error de identidad ausente y no devuelve las órdenes de `usr-student-001`

**Escenario 4**  

- **Dado**: un usuario con `X-User-Roles: ROLE_PROFESSOR` asignado al curso
- **Cuando**: llama a `GET /api/market/courses/{courseId}/catalog/manage`
- **Entonces**: responde 200 con la lista de gestión (el rol exacto sigue funcionando)

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `GET /api/market/courses/{courseId}/catalog/manage`, `PATCH /api/market/offers/{id}/status`, `GET /api/market/orders`, `GET /api/market/courses/{courseId}/catalog`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 3
- **Prioridad (MoSCoW / Numérica)**: Should

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|3|Should|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado y gateway (Tema responsable de la identidad).
- Módulos afectados: `configs/filters/GatewayIdentityFilter.java`, `controllers/CourseCatalogManageController.java`, `CatalogOfferController.java`, `StorefrontCatalogController.java`, `StudentOrderController.java`, `services/impl/CourseCatalogManageServiceImpl.java`.
- Otros equipos / aprobaciones: confirmar con el gateway que `X-User-Id` y `X-User-Roles` se inyectan siempre ([[Gateway e identidad]]).
- Impacto en datos / migraciones: ninguno.
- Riesgos y mitigación (opcional): al quitar el usuario por defecto se rompen pruebas y la demostración local que dependen de él; mitigación: enviar las cabeceras en las pruebas y documentar las de dev. El respaldo `X-Roles` debe quitarse después de confirmar que ningún cliente lo usa.

Relación: [[Estado actual del código]] (gaps 9, 12 y 17), [[Roadmap de trabajo]] (P1), [[Errores de la API]].

---

## Estado en Taiga

Al 2026-10-04:

| Tarea | Estado | Dónde |
|---|---|---|
| #5215 T01 - Parsear los roles sin contains | Closed | PR #86 de `tpi-market`, mergeado en `develop` el 2026-10-03 (`3e2b88b`, aprobado por Patinio). Revisado también por Valentino Mellia sin bloqueantes |
| #5216 T02 - Eliminar el bypass por cabecera de roles vacía | Ready for test | PR #92 de `tpi-market`, sin mergear; revisado por Patinio y tommikimmel, con las correcciones de la revisión ya hechas |
| #5217 T03 - Quitar el usuario por defecto usr-student-001 | New | — |
| #5218 T04 - Probar la seguridad por rol y endpoint | New | — |

Lo que dejó la T01 y la revisión del PR #86:

- **Hallazgo.** La lectura por subcadena era explotable: un profesor no asignado con `X-User-Roles: PROFESSOR, SYSTEMS` cambiaba el estado de ofertas de otro curso (200, porque `SYSTEMS` contiene `MS`). Con el PR responde 403.
- **Para la T02.** Los dos chequeos que se saltean con cabecera vacía (`validateProfessorAccess` y `CourseCatalogSummaryServiceImpl.validateRole`) quedaron sin cambios y fijados con pruebas, para que la T02 los cambie a propósito. Deben seguir mirando la cabecera cruda: si pasan a preguntar "no hay roles conocidos", un valor como `NOT_ADMIN` también se saltearía el chequeo.
- **Decisiones.** Roles desconocidos y prefijo `ROLE_`: [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]] se cerró el 2026-10-04 con la opción 1, como enmienda de [[DEC-006 - Roles y permisos según el código y los headers del gateway]]. Las llamadas de servicio con `MS` ([[Q-021 - Principal de servicio MS en las reglas de negocio]]) quedaron resueltas en la T02, ver abajo.
- **Coordinación con el PR #85 de `tpi-market`** (resumen de ventas, US-1053, sin mergear). `CourseSalesSummaryServiceImpl.validateAccess` también compara roles con `contains()` y el controlador agrega `X-Roles`. Si el PR #86 entra primero, el #85 debe rebasarse y usar `UserRole`.

Lo que dejó la T02 (PR #92 de `tpi-market`, 2026-10-03):

- **Cabecera vacía.** `validateProfessorAccess` y el chequeo de lector del resumen ya no se saltean sin roles: responden 403 `professor-not-assigned`. Se quitó la condición en lugar de reescribirla como "no hay roles conocidos", tal como pedía la T01. Para un usuario ya respondía 403 la capa de `@PreAuthorize`; el único llamador real del bypass era un servicio con `MS`.
- **Q-021 adelantada.** Cerrar el bypass dejaba a ese servicio con 403 en la ruta del curso, así que se resolvió acá en vez de en la T04: [[DEC-017 - Servicios con MS en las rutas de estado de oferta]]. Las dos rutas de estado leen el principal autenticado y `MS` es administrativo en ambas.
- **Revisión del PR #92 (2026-10-04).** Se sumaron dos correcciones: el filtro descarta los ámbitos de servicio con forma de rol (`ROLE_ADMIN`) y `validateProfessorAccess` deniega cuando falta el id del usuario.
- **Para la T03 y la T04.** Los GET de detalle de la vitrina (`GET /offers/{id}`, `GET /courses/{courseId}/catalog/{itemId}`) permiten `MS` pero evalúan al servicio como `usr-student-001` (la T03 quita ese valor por defecto; la T04 decide si pasan a leer el principal). `MS` en los roles lectores del resumen nunca coincide porque su `@PreAuthorize` no lo permite. ADMIN y GESTOR siguen pasando por el chequeo de asignación al listar, publicar y editar. Todo va a la matriz de la T04.

## Tareas

### T01 - Parsear los roles sin contains

**Objetivo:** Reemplazar la comparación por subcadena con una comparación exacta de cada rol.

- Parser común que separa `X-User-Roles` por comas y compara cada rol de forma exacta, con y sin prefijo `ROLE_`
- Reemplaza los `contains()` de `CourseCatalogManageServiceImpl`
- Quitar el respaldo `X-Roles`
- Hecho cuando: `NOT_ADMIN` y cualquier valor que contenga `MS` ya no otorgan permisos

Estimación: 5 h

### T02 - Eliminar el bypass por cabecera de roles vacía

**Objetivo:** Impedir que una cabecera vacía omita el control de acceso del profesor.

- `validateProfessorAccess` deja de omitir el chequeo cuando la cabecera está vacía
- Responder 403 en ese caso
- Hecho cuando: una petición con `X-User-Roles` vacío a una ruta de gestión responde 403

Estimación: 3 h

### T03 - Quitar el usuario por defecto usr-student-001

**Objetivo:** Evitar que se opere con una identidad que el cliente no envió.

- Eliminar los `defaultValue` y la constante `DEFAULT_USER_ID` en `StorefrontCatalogController`, `StudentOrderController` y `CatalogOfferController`
- Responder con error por identidad ausente (400 `missing-header` o 401, a confirmar con el equipo al iniciar la tarea)
- Hecho cuando: una petición sin `X-User-Id` falla y ya no queda ninguna referencia a `usr-student-001`

Estimación: 3 h

### T04 - Probar la seguridad por rol y endpoint

**Objetivo:** Cubrir con pruebas automáticas las reglas estrictas de roles e identidad.

- Pruebas parametrizadas por rol y endpoint
- Casos de subcadena, cabecera vacía y ausencia de `X-User-Id`
- Hecho cuando: las pruebas parametrizadas pasan en verde y fallan si se reintroduce `contains()`

Estimación: 5 h
