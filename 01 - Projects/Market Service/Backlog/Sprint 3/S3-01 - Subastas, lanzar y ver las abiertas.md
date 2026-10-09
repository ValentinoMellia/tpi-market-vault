---
tipo: historia
estado: borrador
verificado_contra: DEC-014
actualizado: 2026-10-09
tags: [mercado, backlog, sprint-2, subastas]
sprint: 2
taiga: "#5347"
puntos: 8
prioridad: Should
horas: 27
---
# S3-01 - Subastas, lanzar y ver las abiertas

> Primera porción de las [[Subasta|subastas]] que se puede construir sin Accounting: el profesor lanza una subasta a partir de una oferta de catálogo y los estudiantes ven las abiertas de su curso. Reemplaza a #578 y #579 de [[Épica 577 - Subastas]]. 6 tareas, 27 h, 8 puntos, Should. Su alcance sigue el diseño técnico de [[Subasta]], borrador del spike [[S2-09c - SPIKE Diseño técnico de subastas]] (aún sin confirmar por el equipo). El código de esta historia se hace dentro del Sprint 2.

## [G11] — Subastas: lanzar y ver las abiertas

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor asignado a un curso (y estudiante inscripto en él)
- **Quiero**: lanzar una subasta a partir de una oferta de catálogo de mi curso, y que los estudiantes vean las subastas abiertas
- **Para**: poner un ítem a la venta con tiempo límite y que los estudiantes sepan qué se subasta, cuánto falta y bajo qué reglas

---

## Notas / Observaciones

- [ ] Reglas de negocio: se subasta una unidad de una [[Oferta de catálogo]] basada en plantilla, con snapshot del ítem al lanzar ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]). Hay dos modos, **puja visible** y **ciega**. La duración va de 1 hora a 14 días. En puja visible, los últimos X minutos son una fase final ciega y X lo define el profesor al lanzar ([[DEC-014 - Reglas de subastas]]); en modo ciega no hay fase final porque toda la subasta es ciega. La base (oferta mínima) es opcional; el incremento mínimo es opcional y solo existe en puja visible. Solo un profesor asignado al curso, o un ADMIN, puede lanzar ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]). Mercado no reserva ni descuenta stock de la oferta de catálogo: la oferta solo aporta la plantilla del ítem ([[Subasta]]).
- [ ] Validaciones: duración entre 1 hora y 14 días; en puja visible, X mayor que 0 y menor que la duración; incremento mínimo, si viene, mayor que 0; base, si viene, no negativa; la oferta de catálogo existe, está activa, es del curso y no es de tipo vida (la épica #577 de Taiga dice que las vidas no se subastan).
- [ ] Datos obligatorios: curso, oferta de catálogo, modo y duración; en puja visible, también la duración de la fase final.
- [ ] Performance (tiempos, volumen, límites): el listado de abiertas va ordenado por cierre más próximo.
- [ ] Seguridad (roles, permisos, datos sensibles): el estudiante debe estar inscripto en el curso ([[Integración con Cursos]]).
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: esta historia **no** retiene monedas ni recibe ofertas. Eso queda para ofertar y mejorar (hoy #580 y #581), que dependen del contrato con Accounting de [[S2-01 - Contrato con Accounting]].

**Alcance de código de esta historia** (según el borrador del spike [[S2-09c - SPIKE Diseño técnico de subastas]], 2026-10-09): se codifica la entidad de la subasta completa, con todos sus campos y el enum de estados, incluidos `DRAFT` y `SCHEDULED`. Los endpoints de esta historia **lanzan directo a `OPEN`**. Guardar borrador, programar el inicio (con el proceso que abre `SCHEDULED`) y las entidades de oferta quedan diseñados en [[Subasta]] y se codifican después. Siguen abiertos, y no afectan a esta historia porque todavía no hay ofertas: el desempate ([[Q-025 - Desempate de las subastas]]) y la regla de la oferta en la fase final ciega ([[DEC-014 - Reglas de subastas]]), y si el `courseId` de las rutas identifica la cohorte.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: un profesor asignado puede lanzar una subasta de una oferta de catálogo de su curso con modo, duración y, según el modo, duración de la fase final (solo en puja visible), incremento mínimo opcional (solo en puja visible) y base opcional; responde 201 y la subasta queda abierta (`OPEN`), sin ofertas.
- [ ] **CA2**: un estudiante, o un profesor no asignado al curso, que intenta lanzar recibe 403 application/problem+json.
- [ ] **CA3**: los datos fuera de regla (duración fuera de 1 hora a 14 días, fase final mayor o igual a la duración, incremento informado y no positivo, base negativa, oferta inactiva, de otro curso o de tipo vida) se rechazan con un 4xx y un motivo claro, sin crear la subasta.
- [ ] **CA4**: un estudiante inscripto lista las subastas abiertas de su curso, ordenadas por cierre más próximo, sin ver las de otros cursos ni las vencidas.
- [ ] **CA5**: en modo ciega el listado no muestra la mejor oferta y la subasta se indica ciega durante toda su duración; en puja visible muestra la mejor oferta (vacía mientras no haya ofertas) e indica si está en su fase final ciega, derivada del tiempo restante.
- [ ] **CA6**: si la oferta de catálogo tiene stock infinito o disponible, la respuesta de lanzar incluye un aviso informativo para el profesor y la subasta se crea igual, sin descontar stock.
- [ ] **Extras (opcional)**: el snapshot conserva el nombre, el tipo y los parámetros de la oferta aunque la oferta cambie después.

---

## BDD (mínimo 3 escenarios)

**Característica:** Lanzar y ver subastas

**Escenario 1**  

- **Dado**: un profesor asignado al curso y una oferta de catálogo activa de tipo escudo
- **Cuando**: lanza una subasta de puja visible de 3 días con fase final de 30 minutos e incremento mínimo de 5 monedas
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

- **Dado**: dos subastas abiertas del curso, una de puja visible y otra ciega
- **Cuando**: un estudiante inscripto lista las subastas abiertas
- **Entonces**: ve ambas ordenadas por cierre más próximo, sin mejor oferta en la ciega, y la de puja visible indica si está en su fase final ciega

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
- Riesgos y mitigación: que el equipo cambie el modelo o los estados al revisar el diseño del spike, que corre en el mismo sprint; mitigación: dejar el modelo de la tarea 1 con el enum de estados completo para no migrar después, y empezar por ella solo con el diseño ya revisado. Otro riesgo: el desempate (oferta más antigua por ahora) todavía contradice a DEC-014; no afecta a esta historia porque todavía no hay ofertas.

Relación: [[Épica 577 - Subastas]], [[Subasta]], [[Roadmap de trabajo]].

---

## Tareas

| # | Taiga | Tarea | Horas | Descripción breve |
|---|---|---|---|---|
| 1 | #5348 | Modelar y persistir la subasta con el snapshot del ítem | 5 | Entidad con modo (`VISIBLE` o `BLIND`), enum de estados completo (`DRAFT`, `SCHEDULED`, `OPEN` y los de cierre), snapshot, inicio y fin, fase final y incremento opcionales, base opcional y versión; consulta de abiertas por curso |
| 2 | #5349 | Validar las reglas de la subasta al lanzar | 4 | Duración, fase final (solo puja visible), incremento y base opcionales, y oferta de catálogo válida y no de tipo vida; errores `problem+json` |
| 3 | #5350 | Endpoint para lanzar una subasta | 5 | `POST` con snapshot de la oferta; 403 si no es profesor asignado o ADMIN; 201 con la subasta abierta (`OPEN`) y aviso informativo si la oferta tiene stock |
| 4 | #5351 | Endpoint para listar las subastas abiertas del curso | 5 | `GET` con abiertas no vencidas, ordenadas por cierre; 403 si no está inscripto |
| 5 | #5352 | Derivar la fase final ciega y ocultar la mejor oferta en modo ciega | 3 | Fase calculada con el tiempo restante, sin guardarla; pruebas con reloj controlado |
| 6 | #5353 | Pruebas de aceptación y contrato de la API de subastas | 5 | Escenarios 1 a 4 y contrato OpenAPI al día |

Cargada en Taiga el 2026-10-02 en el backlog. El mismo día se adelantó al sprint "G11 - Sprint 2" (historia y sus 6 tareas, #5348 a #5353) porque Valentino Mellia sumó horas de capacidad. Las 6 tareas están asignadas a Valentino Mellia; la historia queda sin asignar. Sigue el diseño del spike [[S2-09c - SPIKE Diseño técnico de subastas]]. El 2026-10-09 se ajustaron los criterios a ese diseño (modos puja visible y ciega, incremento y fase final opcionales, aviso de stock y estados completos en el modelo). Las horas no cambiaron: los cambios caben en el margen de ±20 % del resto del plan, a revisar en la planning. Los cambios en Taiga de la historia y de las tareas están pendientes de aplicar.
