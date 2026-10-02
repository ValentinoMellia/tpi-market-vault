---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2, opcional]
sprint: 2
taiga: "#5266"
puntos: 5
prioridad: Could
horas: 14
---
# S2-OPC2 - Frontend de gestión del profesor

> Objetivo opcional: pantallas del profesor para listar, publicar, editar, activar o desactivar ofertas y extender su vencimiento. Depende de [[S2-03 - Reglas de la tienda]] para fijar y extender `publicationExpiresAt`. 4 tareas, 14 h, 5 puntos, Could (opcional).

## [G11] — Frontend de gestión del profesor

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor asignado a un curso
- **Quiero**: gestionar las ofertas de la tienda de mi curso desde la aplicación
- **Para**: publicar, ajustar y retirar ítems sin depender de otro equipo

---

## Notas / Observaciones

- [ ] Reglas de negocio: el profesor solo gestiona los cursos a los que está asignado. Las ofertas no se borran: se desactivan ([[DEC-013 - Reglas de la tienda]], T4). publicationExpiresAt puede extenderse. Al publicar se elige una plantilla activa de GET /api/market/templates.
- [ ] Validaciones: precio mínimo 1; stock opcional (sin totalStock o unlimitedStock significa ilimitado, [[DEC-002 - Stock opcional por oferta]]); errores de validación del backend (errors[]) se muestran junto a cada campo.
- [ ] Datos obligatorios: templateId, itemType, customName, coinPrice al publicar; configuración según el tipo de ítem.
- [ ] Performance (tiempos, volumen, límites): lista de gestión con carga inicial menor a 2 s (a medir).
- [ ] Seguridad (roles, permisos, datos sensibles): rutas visibles solo para PROFESSOR, ADMIN y GESTOR; la API valida igualmente ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]).
- [ ] Accesibilidad (WCAG/teclado/lectores): formularios con etiquetas asociadas, errores anunciados a lectores de pantalla y operación completa por teclado.
- [ ] Otros: confirmar con el PO si el profesor ve las órdenes de su tienda (fuera de alcance de esta historia).

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: el profesor ve la lista de GET /api/market/courses/{courseId}/catalog/manage con estado activa o inactiva, precio, stock y vencimiento.
- [ ] **CA2**: puede publicar una oferta nueva con POST /api/market/courses/{courseId}/catalog/manage y la ve en la lista y en la vitrina del estudiante.
- [ ] **CA3**: puede editar nombre, descripción, precio y stock con PATCH .../manage/{offerId} y activar o desactivar con PATCH .../manage/offers/{itemId}/status.
- [ ] **CA4**: puede extender el vencimiento de una oferta y la fecha nueva se refleja en la lista.
- [ ] **Extras (opcional)**: confirmación antes de desactivar una oferta con compras.

---

## BDD (mínimo 3 escenarios)

**Característica:** Gestión de la tienda por el profesor

**Escenario 1**  

- **Dado**: un profesor asignado a `COURSE_PROG4_2026`
- **Cuando**: abre la pantalla de gestión
- **Entonces**: la aplicación llama a `GET /api/market/courses/COURSE_PROG4_2026/catalog/manage` y muestra sus ofertas

**Escenario 2**  

- **Dado**: el formulario de publicación completo con una plantilla activa
- **Cuando**: el profesor lo envía
- **Entonces**: se llama a `POST /api/market/courses/{courseId}/catalog/manage`, recibe 201 y la oferta aparece en la lista

**Escenario 3**  

- **Dado**: una oferta activa
- **Cuando**: el profesor la desactiva
- **Entonces**: se llama a `PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status` y la oferta se muestra inactiva

**Escenario 4**  

- **Dado**: una oferta próxima a vencer
- **Cuando**: el profesor elige una fecha posterior y guarda
- **Entonces**: `PATCH .../manage/{offerId}` con `publicationExpiresAt` responde 200 y la lista muestra la fecha nueva

---

## Prototipo

- **Capturas**: [PEGAR AQUÍ] (a definir)
- **URL Figma**: a definir
- **Storybook**: a definir
- **Mock API / Swagger**: `GET /api/market/templates`, `GET /api/market/courses/{courseId}/catalog/manage`, `POST /api/market/courses/{courseId}/catalog/manage`, `PATCH /api/market/courses/{courseId}/catalog/manage/{offerId}`, `PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 5
- **Prioridad (MoSCoW / Numérica)**: Could

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|5|Could|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado (API de gestión), gateway, frontend.
- Módulos afectados: módulo de gestión de Mercado del frontend.
- Otros equipos / aprobaciones: Frontend (contrato HTTP y `courseId` como cohorte, [[Q-009 - Endpoints y prefijos]]).
- Impacto en datos / migraciones: ninguno.
- Riesgos y mitigación (opcional): sin [[S2-03 - Reglas de la tienda]] no se puede fijar ni extender `publicationExpiresAt`; en ese caso la tarea 4 queda fuera. Requiere [[S2-02 - Clientes reales de Cursos]] para que la asignación del profesor sea real.

Relación: [[Oferta de catálogo]], [[Plantilla base]], [[Roadmap de trabajo]].

---

## Tareas

### T01 - Maquetar la lista de gestión de ofertas del profesor

**Objetivo:** Mostrar al profesor las ofertas de su curso.

- Tabla de `GET /api/market/courses/{courseId}/catalog/manage`
- Columnas: estado, precio, stock y vencimiento
- Hecho cuando: el profesor ve sus ofertas con los cuatro datos

Estimación: 4 h

### T02 - Maquetar el formulario para publicar una oferta

**Objetivo:** Permitir publicar ofertas desde la interfaz.

- Selección de plantilla activa desde `GET /api/market/templates`
- Campos `templateId`, `itemType`, `customName` y `coinPrice`, y configuración según el tipo de ítem
- Errores de `errors[]` junto a cada campo
- Hecho cuando: una oferta publicada con `POST /api/market/courses/{courseId}/catalog/manage` aparece en la lista

Estimación: 4 h

### T03 - Editar y activar o desactivar ofertas

**Objetivo:** Permitir modificar y cambiar el estado de una oferta.

- Edición de nombre, descripción, precio y stock con `PATCH .../manage/{offerId}`
- Cambio de estado con `PATCH .../manage/offers/{itemId}/status`
- Hecho cuando: los cambios y el nuevo estado se reflejan en la lista

Estimación: 3 h

### T04 - Extender el vencimiento de una oferta

**Objetivo:** Permitir ampliar el plazo de publicación.

- Selector de fecha de `publicationExpiresAt` en la edición
- Confirmación del cambio
- Hecho cuando: la fecha nueva se guarda y se muestra en la lista

Estimación: 3 h
