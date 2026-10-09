---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@c195d386
actualizado: 2026-10-08
tags: [mercado, pregunta-abierta, seguridad, roles]
---
# Q-024 - Qué es el rol GESTOR

> Mercado trata a `GESTOR` casi igual que a `ADMIN` (desde la T05 difieren en cuatro rutas), pero en Cursos `GESTOR` es un rol que se obtiene por asignación a una cohorte, como `PROFESSOR`. ¿Un gestor ve y administra todo el mercado o solo los cursos que gestiona?

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| [[DEC-006 - Roles y permisos según el código y los headers del gateway]] | Nombra `GESTOR` entre los cinco roles, sin definir qué puede hacer | Decisión |
| [[Integración con Users]] | `GESTOR` es uno de los roles globales que Users pone en el JWT (ADMIN, GESTOR, PROFESSOR, STUDENT) | Contrato de Users |
| [[Integración con Cursos]] | `GET /course-cohorts/{id}/membership` devuelve `GESTOR` por asignación a la cohorte, igual que `PROFESSOR` y `PROFESSOR_READ_ONLY` | Contrato de Cursos (previsto); lo va a consumir la T01 de [[S2-02 - Clientes reales de Cursos]] |
| Código de Mercado | `GESTOR` está siempre en el mismo grupo que `ADMIN` | Ver abajo |
| Lectura de Patricio (2026-10-06) | El gestor es como un profesor: tiene que pertenecer al curso; el que ve todo es el admin | Exploración de la T04 de [[S2-04 - Seguridad]] |

## Qué hace hoy el código
Verificado en `develop@c195d386` (después de la T05, PR #124 de `tpi-market`):

- **`@PreAuthorize`:** `GESTOR` aparece en todas las rutas donde aparece `ADMIN` (todas menos las órdenes del alumno).
- **Donde es administrativo, igual que `ADMIN`:** el detalle de vitrina (`DETAIL_BYPASS_ROLES` en `services/impl/StorefrontCatalogServiceImpl.java`), las dos rutas de estado (`ADMINISTRATIVE_ROLES` en `CourseCatalogManageServiceImpl`), el resumen de vitrinas y el de ventas (`ADMINISTRATIVE_ROLES` en `CourseCatalogSummaryServiceImpl` y `CourseSalesSummaryServiceImpl`) y el flujo SSE de órdenes (`PurchaseOrderController`). Con eso, un gestor:
  - ve el detalle de cualquier oferta sin chequeo de inscripción;
  - cambia el estado de cualquier oferta por las dos rutas de estado sin chequeo de asignación ([[DEC-017 - Servicios con MS en las rutas de estado de oferta]]);
  - lee el resumen de vitrinas y el resumen de ventas de cualquier curso;
  - sigue cualquier orden por SSE.
- **Donde se le pide el curso y a `ADMIN` ya no** (desde la T05, que no tocó `GESTOR` a la espera de esta pregunta): listar, publicar y editar ofertas de gestión piden que su `X-User-Id` esté asignado al curso (`INSTRUCTOR_ROLES`; el bypass `ASSIGNMENT_BYPASS_ROLES` de `CourseCatalogManageServiceImpl` solo tiene `ADMIN`). El listado de la vitrina (`GET /courses/{courseId}/catalog`) pide que esté inscripto (`LISTING_BYPASS_ROLES` de `StorefrontCatalogServiceImpl` tiene `ADMIN` y `MS`).

Es decir, `GESTOR` y `ADMIN` ya no son indistinguibles: difieren en esas cuatro rutas (filas 4, 6, 7 y 12 de la matriz de la T04, marcadas "depende de esta pregunta"). Si se elige la opción 1, alcanza con sumar `GESTOR` a esos dos conjuntos. Si se elige la 2, gestión ya le pide la asignación, pero el listado de la vitrina le pide matrícula y no asignación, y las demás rutas lo siguen tratando como administrativo.

## Opciones
1. **`GESTOR` es administrativo global, como hoy.** Ventajas: no cambia código. Desventajas: contradice el modelo de Cursos, donde el gestor lo es de una cohorte; un gestor de un curso podría cambiar ofertas y ver ventas de todos.
2. **`GESTOR` es un rol por curso, como `PROFESSOR`.** Sale del grupo administrativo y en cada ruta se le pide estar asignado al curso (con `membership` de Cursos cuando exista el cliente real). Ventajas: coincide con Cursos y con lo que se espera de un gestor. Desventajas: hay que tocar los cuatro services y el SSE; las rutas sin curso en la ruta (`PATCH /offers/{id}/status`, `GET /offers/{id}`) necesitan buscar el curso de la oferta antes de decidir.
3. **Híbrido:** lectura global (resúmenes, detalle, SSE) y escritura solo en sus cursos. Ventajas: menos cambios que la opción 2. Desventajas: un tercer modelo que no aparece en ninguna fuente.

## Recomendación
Opción 2, si Users y Cursos confirman que el `GESTOR` del JWT es el mismo concepto que el de `membership`. Antes conviene preguntarles a los dos equipos si un usuario puede tener `GESTOR` en el JWT sin estar asignado a ninguna cohorte.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado decide cómo trata el rol. Hay que confirmar con Users (qué significa `GESTOR` en el JWT) y con Cursos (qué devuelve `membership`). Mientras siga abierta, la matriz de seguridad de la T04 de [[S2-04 - Seguridad]] fija el comportamiento actual de `GESTOR` y lo marca como dependiente de esta pregunta. La T05 (#6807, cerrada el 2026-10-07) no cambió nada de `GESTOR`.

## Resolución
Pendiente.
