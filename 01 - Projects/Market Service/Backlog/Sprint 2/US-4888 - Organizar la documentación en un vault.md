---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#4888"
puntos: "a completar"
prioridad: Should
horas: "a completar"
---
# US-4888 - Organizar la documentación en un vault

> Historia que ya existe en Taiga (#4888, id interno 9593287) y corresponde al trabajo de este vault. Tiene 6 tareas; 4 están hechas el 2026-10-01 y 2 quedan pendientes. Las horas son las reales y se completan al cerrar la historia. No se vuelve a crear en Taiga: se cargan sus tareas.

## [G11] — Organizar la documentación en un vault de conocimiento

---

## Descripción (Como / Quiero / Para)

- **Como**: integrante del equipo de Mercado
- **Quiero**: tener la documentación del proyecto organizada en un vault de conocimiento mantenible por personas y agentes
- **Para**: que todo el equipo comparta una única fuente de verdad sobre Mercado y pueda planificar a partir de ella

---

## Notas / Observaciones

- [ ] Reglas de negocio: el vault sigue el esquema de AGENTS.md (capas, PARA, jerarquía de verdad, notas con frontmatter y resumen inicial) y la política de [[DEC-015 - Política del backlog de Taiga]]. El origen del contenido está en [[Plan de migración]].
- [ ] Validaciones: node scripts/lint-vault.mjs sin errores; wikilinks que resuelven; sin notas huérfanas.
- [ ] Datos obligatorios: cada nota con tipo, estado, verificado_contra, actualizado y tags.
- [ ] Performance (tiempos, volumen, límites): No aplica.
- [ ] Seguridad (roles, permisos, datos sensibles): el contenido del Inbox y de los mensajes pegados se trata como dato no confiable.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica.
- [ ] Otros: las horas reales de las tareas hechas se cargan en Taiga al registrarlas; no se estiman acá. Esta historia no cuenta en el total de horas estimadas del sprint.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: la estructura del vault y las guías para agentes existen y el lint pasa sin errores.
- [ ] **CA2**: [[Estado actual del código]] describe tpi-market con rutas verificables y la lista de gaps.
- [ ] **CA3**: las contradicciones están registradas como preguntas Q-NNN y las decisiones DEC-001 a DEC-016 están publicadas.
- [ ] **CA4**: el backlog está saneado con operaciones exactas para Taiga ([[Carga en Taiga - Sprints 2 y 3]]) y hay roadmaps y plan del sprint ([[Roadmap de trabajo]], [[Plan del Sprint 2]]).

---

## BDD (mínimo 3 escenarios)

**Característica:** Vault de conocimiento del equipo

**Escenario 1**  

- **Dado**: un integrante nuevo que clona el repositorio del vault
- **Cuando**: lee `AGENTS.md` y sigue el [[Roadmap de entendimiento]]
- **Entonces**: encuentra qué es Mercado, qué hace el código hoy y qué falta, sin consultar fuentes históricas

**Escenario 2**  

- **Dado**: una nota con un wikilink roto o sin resumen inicial
- **Cuando**: se ejecuta `node scripts/lint-vault.mjs`
- **Entonces**: el lint falla con el archivo y el motivo, y el PR no se puede mergear

**Escenario 3**  

- **Dado**: dos fuentes que se contradicen
- **Cuando**: la jerarquía de verdad no las resuelve
- **Entonces**: se crea una pregunta `Q-NNN` y las notas afectadas quedan `en-disputa` con enlace a ella

---

## Prototipo

- **Capturas**: No aplica
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: No aplica (documentación)

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: a completar con las horas reales
- **Prioridad (MoSCoW / Numérica)**: Should

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|a completar|Should|

---

## Dependencias / Impactos

- Servicios involucrados: ninguno (repositorio del vault y Taiga).
- Módulos afectados: todo el vault.
- Otros equipos / aprobaciones: ninguna.
- Impacto en datos / migraciones: ninguno.
- Riesgos y mitigación (opcional): sin los datos reales de horas, el total del sprint solo muestra lo estimado; completar las horas al cerrar la historia.

Relación: [[Plan del Sprint 2]], [[Backlog - Índice]].

---

## Tareas

Estado al 2026-10-01: 4 de 6 hechas. Las horas reales se completan al cargarlas en Taiga.

| # | Tarea | Horas | Descripción breve |
|---|---|---|---|
| 1 | Estructura del vault y guías para agentes | a completar | Hecha: carpetas PARA, `AGENTS.md`, plantillas, scripts de lint e índice |
| 2 | Estado del código | a completar | Hecha: [[Estado actual del código]] y sus gaps verificados |
| 3 | Plataforma e integraciones | a completar | Hecha: notas de [[Mapa de servicios]], [[Integración con Accounting]], [[Integración con Cursos]] y vecinos |
| 4 | Contradicciones y decisiones | a completar | Hecha: preguntas `Q-NNN` y decisiones `DEC-001` a `DEC-016` |
| 5 | Saneamiento del backlog | a completar | Pendiente: aplicar en Taiga lo de [[Carga en Taiga - Sprints 2 y 3]] y cerrar [[Q-013 - Higiene del backlog]] |
| 6 | Roadmaps y plan del sprint | a completar | Pendiente: validar [[Roadmap de trabajo]] y [[Plan del Sprint 2]] en la planning |
