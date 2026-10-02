---
tipo: guia
estado: vigente
verificado_contra: ninguno
actualizado: 2026-10-01
tags: [mercado, plan, migracion]
taiga: "#4888"
---

# Plan: AulaQuestVault — LLM wiki + second brain de market-service

> Plan con el que se creó este vault: contexto, estructura PARA, reglas y pasos de la migración de la documentación anterior de Mercado.

## Contexto

El servicio market-service (Mercado, T09) de AulaQuest está documentado en `tpi/docs`. Ese material es contradictorio, está desactualizado y usa lenguaje demasiado técnico. En la exploración aparecieron al menos 14 grupos de conflicto:
- Quién es dueño del inventario y de las vidas.
- Si hay stock o no.
- Si los holds van por Kafka o por REST.
- Cinco máquinas de estados distintas para la orden.
- Nombres de topics y eventos, endpoints y roles.
- Diferencias entre el contrato de Banco y los docs de Mercado.
- Historias de usuario duplicadas o mal ubicadas.

Por otro lado, el código (`tpi-market`, `develop@7528610`) tiene su propia realidad, que tampoco coincide del todo con los docs.

**Objetivo:** hacer una **migración completa**. El conocimiento se refactoriza a un vault de Obsidian con lenguaje humano, siguiendo el patrón LLM wiki de Karpathy y organizado con PARA (Tiago Forte). El vault pasa a ser la única fuente del equipo. **Ninguna nota enlaza ni referencia a `tpi/docs`**: los docs viejos son el insumo, no el destino.

## Decisiones de organización

- **Idioma de las notas:** español neutro y profesional, que es el que usan el equipo y el proyecto. Los identificadores de código se mantienen como están (`OrderStatus`, `HOLD_CREATED`).
- **Jerarquía de verdad** para resolver contradicciones (queda escrita en AGENTS.md):
  1. Decisiones registradas en el vault.
  2. Código actual de `tpi-market`, para saber cómo funciona hoy.
  3. PRD oficial.
  4. El contrato de cada equipo, solo para su propio lado (por ejemplo, el doc de integración de Banco).
  5. CONTEXTO-SPRINT1.
  6. El resto.
- **Ninguna contradicción se silencia.** Si algo no está decidido, la nota lleva `estado: en-disputa` y enlaza a una pregunta abierta.
- **Cómo se mapean las capas de Karpathy:**
  - Raw: el material externo, que se lee una vez y no se copia.
  - Wiki: las notas organizadas con PARA.
  - Schema: AGENTS.md y CLAUDE.md.
  - En la raíz quedan `index.md` y `log.md`.

## Estructura del vault

```
AulaQuestVault/
├── AGENTS.md                 # schema canónico: propósito, estructura, convenciones, operaciones ingest/query/lint, jerarquía de verdad
├── CLAUDE.md                 # @AGENTS.md + específicos de Claude Code (engram, delegación, skills)
├── index.md                  # catálogo por categoría, una línea por nota
├── log.md                    # registro cronológico: "## [AAAA-MM-DD] ingest|decision|query|lint | título"
├── 00 - Inbox/               # capturas nuevas y material pendiente de ingerir
├── 01 - Projects/Market Service/
│   ├── Market Service - Overview.md          # qué es, para qué existe, sus límites (lo que NO es de Mercado)
│   ├── Roadmap de entendimiento.md           # orden de lectura recomendado para quien se suma al equipo
│   ├── Estado actual del código.md           # verdad del código: stack, endpoints, qué es real y qué es mock, gaps
│   ├── Roadmap de trabajo.md                 # próximos pasos: gaps reales + decisiones pendientes + backlog
│   ├── Plan de migración.md                  # este plan, editable por el equipo
│   ├── Decisiones/   DEC-NNN - <título>.md   # ADR liviano: contexto, decisión, alternativas, consecuencias
│   ├── Preguntas abiertas/ Q-NNN - <título>.md  # una por cada contradicción sin resolver
│   └── Backlog/      épicas e historias saneadas (sin duplicados, con el dueño correcto)
├── 02 - Areas/
│   ├── Plataforma AulaQuest/   # mapa de servicios y equipos, gateway y headers de identidad, integraciones (Banco, Cursos, Users, Notificaciones, Backoffice)
│   ├── Dominio Mercado/        # entidades: Plantilla, Oferta de catálogo, Orden de compra, Hold, Subasta, Vencimiento
│   └── Convenciones/           # eventos/Kafka, errores (problem+json), git workflow, calidad de código
├── 03 - Resources/
│   ├── Conceptos/              # Saga, Outbox, Idempotencia, Hold/escrow, SSE, at-least-once, deduplicación…
│   ├── Glosario.md
│   └── Templates/              # plantillas: entidad, concepto, decisión, pregunta, historia
└── 04 - Archive/               # ideas descartadas, con el motivo (Propuesta D enricher, catálogo fijo de 15 ítems, escrow opción 2, inventario dentro de Mercado…)
```

**Frontmatter de cada nota:**
- `tipo`: entidad, concepto, decision, pregunta, integracion, estado, historia o guia.
- `estado`: vigente, borrador, en-disputa o archivado.
- `verificado_contra`: por ejemplo `codigo@7528610` o `DEC-003`.
- `actualizado`.
- `tags`.

Los enlaces entre notas son `[[wikilinks]]` de Obsidian.

## Ejecución (iterativa, en esta sesión)

1. **Andamiaje:** AGENTS.md, CLAUDE.md, index, log, templates, carpetas, `templates.json` apuntando a `03 - Resources/Templates`, y este plan copiado a `Plan de migración.md`.
2. **Estado actual del código:** la nota `Estado actual del código` y las entidades de dominio tal como están implementadas. Incluye:
   - La máquina de estados real.
   - La saga con outbox.
   - Qué clientes son reales y cuáles son mock.
   - Los gaps conocidos: falta `BankHoldQueryClient` con kafka; los clientes de Cursos son mock; `unitsSold` nunca se incrementa; no hay tope de vidas; la variable de entorno `KAFKA_SERVERS` no coincide; no hay CI sobre develop.
3. **Plataforma e integraciones:** el mapa de servicios (allowlist del gateway, headers de identidad, JWKS de users, endpoints de membership de course, puerto 8092 en el registry) y la integración con Banco.
4. **Registro de contradicciones:** una nota `Q-NNN` por cada grupo de conflicto. Son 14:
   1. Dueño del inventario.
   2. Dueño de las vidas y dónde se valida el tope.
   3. Stock.
   4. Transporte de los holds.
   5. Estados de la orden.
   6. Envelope y naming (SNAKE vs HYPHEN, topics de comandos).
   7. Contrato con Banco (correlación, motivos, TTL, liberación en lote).
   8. Orden de la saga según el doc Transacciones.
   9. Endpoints y prefijos.
   10. Roles.
   11. Efectos y consumo de ítems.
   12. Alcance de las subastas.
   13. Higiene del backlog.
   14. Vencimiento de ítems.
5. **Rondas de decisión con vos**, una pregunta a la vez. Cada respuesta se convierte en una nota `DEC-NNN`, cierra su `Q-NNN` y actualiza las notas afectadas. Cuando el código ya resolvió algo, lo propongo como opción por defecto.
6. **Backlog saneado:** épicas e historias vigentes con su dueño correcto, duplicados cerrados (#130/#810) y la épica de inventario marcada como de otro equipo.
7. **Roadmaps:** uno de entendimiento (en qué orden leer) y uno de trabajo (próximos pasos por prioridad).
8. **Lint:** sin notas huérfanas, sin links rotos, sin referencias a `tpi/docs`, con el index al día y cada nota `en-disputa` enlazada a su Q.

La redacción de los pasos 2, 3, 4, 6 y 7 la delego a un sub-agente escritor, al que le paso los reportes de exploración ya compilados. Las decisiones del paso 5 las tomamos juntos, en el hilo.

## Registro en Taiga

Al empezar la ejecución, creo en el proyecto de Mercado en Taiga una user story corta con sus tareas. Antes de crearla busco el proyecto con `listProjects` y confirmo con vos cuál es si aparece más de uno.

**US:** "Organizar la documentación de Mercado en un vault de conocimiento"
- *Como* integrante del equipo de Mercado, *quiero* toda la documentación del servicio migrada, sin contradicciones y escrita en lenguaje claro, *para* entender el proyecto y saber cómo seguir.
- **Criterios de aceptación:**
  - El vault reemplaza a `docs`.
  - Las contradicciones quedan resueltas o registradas como preguntas abiertas.
  - Hay un roadmap de entendimiento y otro de trabajo.

**Tareas:**
1. Armar la estructura del vault y las guías para agentes (AGENTS.md / CLAUDE.md).
2. Documentar el estado actual del código.
3. Documentar la plataforma y las integraciones.
4. Registrar las contradicciones y tomar decisiones con el equipo.
5. Sanear el backlog de Mercado.
6. Escribir los roadmaps de entendimiento y de trabajo.

## Verificación

- `rg -i "tpi/docs|tpi\\\\docs|\.docx|\.pdf" AulaQuestVault` no devuelve referencias al material viejo.
- Un script valida los wikilinks: todo `[[x]]` apunta a una nota que existe y toda nota aparece en `index.md`.
- Cada afirmación sobre el código en `Estado actual del código` indica una ruta verificable dentro de `tpi-market`.
- Al abrir el vault en Obsidian, el graph no muestra huérfanos y los templates funcionan.
- `log.md` tiene una entrada por cada ingest y por cada decisión tomada.
