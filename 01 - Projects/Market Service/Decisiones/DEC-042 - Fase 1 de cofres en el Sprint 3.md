---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-21
actualizado: 2026-10-23
tags: [mercado, decision, cofres, alcance, sprint-3]
---
# DEC-042 - Fase 1 de cofres en el Sprint 3

> El backend de la fase 1 de los cofres (premios de ítem) se construye en el Sprint 3, como tres historias de Taiga: US-12002, US-12003 y US-12004. Enmienda solo en este punto el «nada se construye en el Sprint 3» de [[DEC-035 - Cofres en dos fases]].

## Contexto
[[DEC-035 - Cofres en dos fases]] (2026-10-17) dividió los cofres en dos fases y dejó las historias para la próxima planning. Decía que en el Sprint 3, que termina el 2026-10-25, no se construía nada.

El 2026-10-21 el equipo de Mercado (Patricio Fernandez) decidió adelantar el backend de la fase 1. Las historias se cargaron ese día en el Sprint 3 de G11 (`G11 - Sprint 03`), asignadas a Patricio.

## Decisión
- **Backend de la fase 1 en el Sprint 3.** Las historias H1 a H3 de DEC-035 pasan a Taiga así:

| DEC-035 | Historia de Taiga | Qué |
|---|---|---|
| H1 | US-12002 ([[S3-02 - Cofres, el profesor crea y gestiona]]) | Modelo, configuración y gestión del profesor |
| H2 | US-12003 | Vista del alumno: listado y detalle de los cofres publicados |
| H3 | US-12004 | Compra con sorteo y entrega |

- **El resto de DEC-035 sigue igual.** El frontend de la fase 1 (H4 y H5) y la fase 2 (H6, monedas y XP) no cambian de fecha. La fase 2 sigue esperando a Accounting y a Roadmap.

## Alternativas descartadas
- **Esperar a la próxima planning, como decía DEC-035:** la gestión, la vista del alumno y la compra quedaban sin backend hasta el Sprint 4, que todavía no existe en Taiga para G11.
- **Editar DEC-035:** estaba en una PR abierta del vault (PR 51) y registra lo que se decidió el 2026-10-17. Una decisión nueva deja el cambio a la vista.

## Consecuencias
- **Código.** La US-12002 ya está en `develop` de `tpi-market`, salvo la T07 (#12011, PR 282, abierta): ver [[S3-02 - Cofres, el profesor crea y gestiona]] y [[Cofre]].
- **Taiga.** US-12003 y US-12004 están en el Sprint 3. El sorteo de la US-12004 tiene que repartir el peso solo entre las rarezas con premios, como ya hace la gestión.
- **Lectura de DEC-035.** Donde DEC-035 dice «nada se construye en el Sprint 3», vale esta decisión.

## Notas afectadas
[[DEC-035 - Cofres en dos fases]], [[Cofre]], [[Cofres y nuevos ítems]], [[S3-02 - Cofres, el profesor crea y gestiona]], [[Decisiones - Índice]], [[Market Service - Overview]].
