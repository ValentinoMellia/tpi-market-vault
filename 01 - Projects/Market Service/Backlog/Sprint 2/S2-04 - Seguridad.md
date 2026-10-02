---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-02
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "5214"
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

- [ ] Reglas de negocio: la cabecera oficial de roles es `X-User-Roles`; los roles son STUDENT, PROFESSOR, ADMIN, GESTOR y MS ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]). Se quita el respaldo `X-Roles`.
- [ ] Validaciones: comparación exacta de cada rol de la cabecera (separada por comas), sin `contains()`: hoy `rolesHeader.contains("MS")` también acepta cualquier valor que contenga `MS`, y `contains("ADMIN")` acepta `NOT_ADMIN` (`services/impl/CourseCatalogManageServiceImpl.java`, líneas 162 a 189 y 343 a 348).
- [ ] Datos obligatorios: `X-User-Id` y `X-User-Roles` en toda ruta autenticada; si falta `X-User-Id` la respuesta es 400 `missing-header` o 401, no un usuario por defecto.
- [ ] Performance (tiempos, volumen, límites): sin impacto.
- [ ] Seguridad (roles, permisos, datos sensibles): `GatewayIdentityFilter` sigue confiando en las cabeceras del gateway sin validar JWT ([[Gateway e identidad]]); validar JWT queda fuera de alcance. `validateProfessorAccess` hoy omite el chequeo cuando la cabecera está vacía. Los controladores asumen `usr-student-001` si falta `X-User-Id` (`StorefrontCatalogController`, `StudentOrderController`, `CatalogOfferController`).
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: el código de estado exacto cuando falta la identidad (400 o 401) se confirma con el equipo al inicio de la tarea 3.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: una cabecera `X-User-Roles` con un valor que solo contiene un rol como subcadena (por ejemplo `NOT_ADMIN` o `SYSTEM`) no otorga ADMIN ni MS; verificado con pruebas parametrizadas.
- [ ] **CA2**: `PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status` con `X-User-Roles` vacío o ausente responde 403 y no ejecuta la verificación de profesor como "omitida".
- [ ] **CA3**: ninguna ruta de `/api/market/**` asume `usr-student-001`; sin `X-User-Id` responde con error y la cadena no aparece en el código de producción.
- [ ] **CA4**: no hay referencias a la cabecera `X-Roles` en `GatewayIdentityFilter` ni en los controladores.
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

## Tareas

| # | Tarea | Horas | Descripción breve |
|---|---|---|---|
| 1 | Parseo de roles sin `contains()` | 5 | Parser común que separa `X-User-Roles` por comas y compara cada rol de forma exacta (con y sin prefijo `ROLE_`); quitar el respaldo `X-Roles` |
| 2 | Sin bypass por cabecera vacía | 3 | `validateProfessorAccess` deja de omitir el chequeo cuando la cabecera está vacía; 403 |
| 3 | Quitar `usr-student-001` | 3 | Eliminar los `defaultValue` y la constante `DEFAULT_USER_ID`; error por identidad ausente |
| 4 | Tests de seguridad | 5 | Pruebas parametrizadas por rol y endpoint, incluidos los casos de subcadena, cabecera vacía y falta de `X-User-Id` |
