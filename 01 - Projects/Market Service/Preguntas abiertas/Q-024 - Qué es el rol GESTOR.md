---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@f7457882
actualizado: 2026-10-06
tags: [mercado, pregunta-abierta, seguridad, roles]
---
# Q-024 - Qué es el rol GESTOR

> Mercado trata a `GESTOR` igual que a `ADMIN` en todas las rutas, pero en Cursos `GESTOR` es un rol que se obtiene por asignación a una cohorte, como `PROFESSOR`. ¿Un gestor ve y administra todo el mercado o solo los cursos que gestiona?

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| [[DEC-006 - Roles y permisos según el código y los headers del gateway]] | Nombra `GESTOR` entre los cinco roles, sin definir qué puede hacer | Decisión |
| [[Integración con Users]] | `GESTOR` es uno de los roles globales que Users pone en el JWT (ADMIN, GESTOR, PROFESSOR, STUDENT) | Contrato de Users |
| [[Integración con Cursos]] | `GET /course-cohorts/{id}/membership` devuelve `GESTOR` por asignación a la cohorte, igual que `PROFESSOR` y `PROFESSOR_READ_ONLY` | Contrato de Cursos (previsto); lo va a consumir la T01 de [[S2-02 - Clientes reales de Cursos]] |
| Código de Mercado | `GESTOR` está siempre en el mismo grupo que `ADMIN` | Ver abajo |
| Lectura de Patricio (2026-10-06) | El gestor es como un profesor: tiene que pertenecer al curso; el que ve todo es el admin | Exploración de la T04 de [[S2-04 - Seguridad]] |

## Qué hace hoy el código
Verificado en `develop@f7457882`:

- **`@PreAuthorize`:** `GESTOR` aparece en todas las rutas donde aparece `ADMIN` (todas menos las órdenes del alumno).
- **Grupo administrativo:** `ADMINISTRATIVE_ROLES` incluye `GESTOR` en `StorefrontCatalogServiceImpl`, `CourseCatalogManageServiceImpl`, `CourseCatalogSummaryServiceImpl` y `CourseSalesSummaryServiceImpl`; el flujo SSE de órdenes también lo trata como privilegiado (`PurchaseOrderController`). Con eso, un gestor:
  - ve el detalle de cualquier oferta sin chequeo de inscripción;
  - cambia el estado de cualquier oferta por las dos rutas de estado sin chequeo de asignación ([[DEC-017 - Servicios con MS en las rutas de estado de oferta]]);
  - lee el resumen de vitrinas y el resumen de ventas de cualquier curso;
  - sigue cualquier orden por SSE.
- **Donde sí se le pide el curso:** listar, publicar y editar ofertas de gestión (`INSTRUCTOR_ROLES` en `CourseCatalogManageServiceImpl.validateProfessorAccess`) piden que su `X-User-Id` esté asignado al curso, lo mismo que a `ADMIN`. El listado de la vitrina (`GET /courses/{courseId}/catalog`) pide que esté inscripto, también igual que a `ADMIN`.

Es decir, hoy `GESTOR` y `ADMIN` son indistinguibles en Mercado.

## Opciones
1. **`GESTOR` es administrativo global, como hoy.** Ventajas: no cambia código. Desventajas: contradice el modelo de Cursos, donde el gestor lo es de una cohorte; un gestor de un curso podría cambiar ofertas y ver ventas de todos.
2. **`GESTOR` es un rol por curso, como `PROFESSOR`.** Sale del grupo administrativo y en cada ruta se le pide estar asignado al curso (con `membership` de Cursos cuando exista el cliente real). Ventajas: coincide con Cursos y con lo que se espera de un gestor. Desventajas: hay que tocar los cuatro services y el SSE; las rutas sin curso en la ruta (`PATCH /offers/{id}/status`, `GET /offers/{id}`) necesitan buscar el curso de la oferta antes de decidir.
3. **Híbrido:** lectura global (resúmenes, detalle, SSE) y escritura solo en sus cursos. Ventajas: menos cambios que la opción 2. Desventajas: un tercer modelo que no aparece en ninguna fuente.

## Recomendación
Opción 2, si Users y Cursos confirman que el `GESTOR` del JWT es el mismo concepto que el de `membership`. Antes conviene preguntarles a los dos equipos si un usuario puede tener `GESTOR` en el JWT sin estar asignado a ninguna cohorte.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado decide cómo trata el rol. Hay que confirmar con Users (qué significa `GESTOR` en el JWT) y con Cursos (qué devuelve `membership`). Mientras siga abierta, la matriz de seguridad de la T04 de [[S2-04 - Seguridad]] fija el comportamiento actual de `GESTOR` y lo marca como dependiente de esta pregunta, y la T05 (#6807) no cambia nada de `GESTOR` hasta que haya una decisión.

## Resolución
Pendiente.
