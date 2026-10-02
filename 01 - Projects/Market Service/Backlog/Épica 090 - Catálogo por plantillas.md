---
tipo: historia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, epica]
taiga: "#90"
epica: "Catálogo abierto por plantillas"
---
# Épica 090 - Catálogo por plantillas

> El profesor publica y gestiona ofertas a partir de plantillas base, y el estudiante las ve en la vitrina de su curso.

## Objetivo
Que cada curso tenga su propio catálogo, armado desde una [[Plantilla base]] y publicado como [[Oferta de catálogo]]. Es parte del alcance del Sprint 1.

## Historias
| Taiga # | Título | Estado en el código |
|---|---|---|
| #92 | Publicar una oferta (5 pts) | implementada |
| #94 | Ver la vitrina del curso | implementada |
| #95 | Editar una oferta | implementada |
| #96 | Activar o desactivar una oferta | implementada (permisos según [[DEC-006 - Roles y permisos según el código y los headers del gateway]]) |
| #98 | Ver el detalle de una oferta | implementada |
| #945 | Listar plantillas base | implementada |
| #946 | Ver el catálogo completo | no iniciada (sin evidencia en el código; la vitrina por curso existe) |

## Estado en Taiga
Solo US-092 y US-095 están en Done; las demás siguen en New aunque el código implementa US-094, 096, 098, 945 y 946 (gestión de la tienda). Los estados se mantienen a mano ([[Q-013 - Higiene del backlog]]).

## Notas
- Reglas de la tienda decididas (T1, T3 a T6, con T6 modificada) en [[DEC-013 - Reglas de la tienda]]; origen en [[Q-015 - Reglas de la tienda]]. Implican trabajo en publicar (#92: validaciones y `publicationExpiresAt`) y editar (#95: `publicationExpiresAt`).
- Rutas en [[Estado actual del código]]; contrato decidido en [[DEC-005 - Endpoints y prefijos según el código]].
- Stock opcional: [[DEC-002 - Stock opcional por oferta]].
- #945 y #946 no estaban exportadas ([[Q-013 - Higiene del backlog]]).
