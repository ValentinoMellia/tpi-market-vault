---
tipo: historia
estado: borrador
verificado_contra: DEC-014
actualizado: 2026-10-02
tags: [mercado, backlog, sprint-3, subastas]
sprint: 3
taiga: "5347"
puntos: 8
prioridad: Should
horas: 27
---
# S3-01 - Subastas, lanzar y ver las abiertas

> Primera porción de las [[Subasta|subastas]] que se puede construir sin Accounting: el profesor lanza una subasta a partir de una oferta de catálogo y los estudiantes ven las abiertas de su curso. Reemplaza a #578 y #579 de [[Épica 577 - Subastas]]. 6 tareas, 27 h, 8 puntos, Should. Es una propuesta: depende del diseño del spike [[S2-09c - SPIKE Diseño técnico de subastas]].

## [G11] — Subastas: lanzar y ver las abiertas

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor asignado a un curso (y estudiante inscripto en él)
- **Quiero**: lanzar una subasta a partir de una oferta de catálogo de mi curso, y que los estudiantes vean las subastas abiertas
- **Para**: poner un ítem a la venta con tiempo límite y que los estudiantes sepan qué se subasta, cuánto falta y bajo qué reglas

---

## Notas / Observaciones

- [ ] Reglas de negocio: se subasta una unidad de una [[Oferta de catálogo]] basada en plantilla, con snapshot del ítem al lanzar ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]). Hay dos modos, abierta y ciega. La duración va de 1 hora a 14 días. Los últimos X minutos son una fase final ciega y X lo define el profesor al lanzar ([[DEC-014 - Reglas de subastas]]). El incremento mínimo es configurable por subasta y la oferta mínima es opcional. Solo un profesor asignado al curso, o un ADMIN, puede lanzar ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]).
- [ ] Validaciones: duración entre 1 hora y 14 días; X mayor que 0 y menor que la duración; incremento mínimo mayor que 0; oferta mínima, si viene, no negativa; la oferta de catálogo existe, está activa, es del curso y no es de tipo vida (la épica #577 de Taiga dice que las vidas no se subastan).
- [ ] Datos obligatorios: curso, oferta de catálogo, modo, duración, duración de la fase final e incremento mínimo.
- [ ] Performance (tiempos, volumen, límites): el listado de abiertas va ordenado por cierre más próximo.
- [ ] Seguridad (roles, permisos, datos sensibles): el estudiante debe estar inscripto en el curso ([[Integración con Cursos]]).
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: esta historia **no** retiene monedas ni recibe ofertas. Eso queda para ofertar y mejorar (hoy #580 y #581), que dependen del contrato con Accounting de [[S2-01 - Contrato con Accounting]].

**Pendiente de confirmar en el spike** [[S2-09c - SPIKE Diseño técnico de subastas]]: si al lanzar se reserva stock de la oferta de catálogo, si existen los estados `DRAFT` y `SCHEDULED` o la subasta se lanza directamente `OPEN`, y las rutas de los endpoints. Sigue abierta la regla de la oferta sellada de la fase final ([[DEC-014 - Reglas de subastas]]), pero no afecta a esta historia porque todavía no hay ofertas.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: un profesor asignado puede lanzar una subasta de una oferta de catálogo de su curso con modo, duración, duración de la fase final, incremento mínimo y oferta mínima opcional; responde 201 y la subasta queda abierta, sin ofertas.
- [ ] **CA2**: un estudiante, o un profesor no asignado al curso, que intenta lanzar recibe 403 `application/problem+json`.
- [ ] **CA3**: los datos fuera de regla (duración fuera de 1 hora a 14 días, fase final mayor o igual a la duración, incremento no positivo, oferta inactiva, de otro curso o de tipo vida) se rechazan con un 4xx y un motivo claro, sin crear la subasta.
- [ ] **CA4**: un estudiante inscripto lista las subastas abiertas de su curso, ordenadas por cierre más próximo, sin ver las de otros cursos ni las vencidas.
- [ ] **CA5**: en modo ciega el listado no muestra la mejor oferta; en modo abierta la muestra (vacía mientras no haya ofertas); en ambos indica si la subasta está en su fase final ciega, derivada del tiempo restante.
- [ ] **Extras (opcional)**: el snapshot conserva el nombre, el tipo y los parámetros de la oferta aunque la oferta cambie después.

---

## BDD (mínimo 3 escenarios)

**Característica:** Lanzar y ver subastas

**Escenario 1**  

- **Dado**: un profesor asignado al curso y una oferta de catálogo activa de tipo escudo
- **Cuando**: lanza una subasta abierta de 3 días con fase final de 30 minutos e incremento mínimo de 5 monedas
- **Entonces**: responde 201 y la subasta queda abierta, sin ofertas, con el snapshot de la oferta

**Escenario 2**  

- **Dado**: un estudiante inscripto en el curso
- **Cuando**: intenta lanzar una subasta
- **Entonces**: responde 403 `problem+json` y no se crea nada

**Escenario 3**  

- **Dado**: un profesor asignado al curso
- **Cuando**: lanza una subasta con duración de 15 días
- **Entonces**: responde 4xx indicando que el máximo es de 14 días y no se crea la subasta

**Escenario 4**  

- **Dado**: dos subastas abiertas del curso, una abierta y otra ciega
- **Cuando**: un estudiante inscripto lista las subastas abiertas
- **Entonces**: ve ambas ordenadas por cierre más próximo, sin mejor oferta en la ciega, y cada una indica si está en su fase final ciega

---

## Prototipo

- **Mock API / Swagger**: propuesto, a confirmar en el spike: `POST /api/market/courses/{courseId}/auctions` y `GET /api/market/courses/{courseId}/auctions`, con el prefijo de [[DEC-005 - Endpoints y prefijos según el código]].

---

## Estimación / Prioridad

- **Puntos (Fibonacci)**: 8
- **Prioridad (MoSCoW / Numérica)**: Should

---

## Dependencias / Impactos

- Servicios involucrados: Mercado y Cursos (matrícula y asignación de profesor).
- Módulos afectados: catálogo, un módulo nuevo de subastas y `GlobalExceptionHandler`.
- Otros equipos / aprobaciones: ninguno; no usa a Accounting.
- Depende de: el diseño del spike [[S2-09c - SPIKE Diseño técnico de subastas]] (#5256); los clientes reales de Cursos de [[S2-02 - Clientes reales de Cursos]] (#5202), aunque puede avanzar con el cliente simulado; y el parseo exacto de roles de [[S2-04 - Seguridad]] (#5214).
- Impacto en datos / migraciones: tablas nuevas de subasta; no hay Flyway, el esquema lo actualiza Hibernate.
- Riesgos y mitigación: que el spike cambie el modelo o los estados; mitigación: empezar por la tarea 1 cuando el spike la cierre.

Relación: [[Épica 577 - Subastas]], [[Subasta]], [[Roadmap de trabajo]].

---

## Tareas

| # | Taiga | Tarea | Horas | Descripción breve |
|---|---|---|---|---|
| 1 | #5348 | Modelar y persistir la subasta con el snapshot del ítem | 5 | Entidad con modo, estado, snapshot, duración, fase final, incremento, oferta mínima y versión; consulta de abiertas por curso |
| 2 | #5349 | Validar las reglas de la subasta al lanzar | 4 | Duración, fase final, incremento, oferta mínima y oferta de catálogo válida y no de tipo vida; errores `problem+json` |
| 3 | #5350 | Endpoint para lanzar una subasta | 5 | `POST` con snapshot de la oferta; 403 si no es profesor asignado o ADMIN; 201 con la subasta abierta |
| 4 | #5351 | Endpoint para listar las subastas abiertas del curso | 5 | `GET` con abiertas no vencidas, ordenadas por cierre; 403 si no está inscripto |
| 5 | #5352 | Derivar la fase final ciega y ocultar la mejor oferta en modo ciega | 3 | Fase calculada con el tiempo restante, sin guardarla; pruebas con reloj controlado |
| 6 | #5353 | Pruebas de aceptación y contrato de la API de subastas | 5 | Escenarios 1 a 4 y contrato OpenAPI al día |

Cargada en Taiga el 2026-10-02 en el backlog, sin sprint (el Sprint 3 todavía no está creado) y con las tareas sin asignar. Las horas son una propuesta con el margen de ±20 % del resto del plan.
