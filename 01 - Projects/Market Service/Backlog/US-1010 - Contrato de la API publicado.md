---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-02
tags: [mercado, backlog, taiga]
taiga: "#1010"
puntos: 2
prioridad: Must
horas: 10
---
# US-1010 - Contrato de la API publicado

> Historia #1010 de Taiga ("Publicar el contrato de la API antes de programarla"). El contrato ya está casi todo en el código, así que de sus tres tareas se archiva una y se reescriben dos, más una nueva: que otros equipos puedan abrirlo, que el archivo exportado esté al día y que tenga ejemplos. No forma parte de las 13 historias del [[Plan del Sprint 2]]; su lugar depende de [[Q-018 - Alcance real del Sprint 2 en Taiga]].

## Qué pide la historia

Que lo que se le puede pedir a Mercado esté escrito y se pueda abrir desde el navegador, con sus datos y sus errores, de modo que otro equipo entienda cómo hablarnos sin preguntar. Los criterios CA1 a CA3 de Taiga (publicado, completo, comprensible para otro equipo) siguen vigentes; lo que cambia son las tareas.

## Qué hay hoy en el código

Verificado en `tpi-market`, `develop@7528610`:

- Los 13 endpoints de negocio (plantillas, publicar, editar, activar o desactivar, vitrina, comprar, seguir por [[SSE]] y mis compras) tienen `@Operation` y `@ApiResponses`, con el esquema del éxito y `ErrorApi` como `application/problem+json` en los errores ([[Errores de la API]]).
- `/swagger-ui.html` y `/v3/api-docs` están abiertos sin autenticación en `configs/SecurityConfig.java`; `configs/SpringDocConfig.java` arma el OpenAPI.
- No hay ningún `@ExampleObject`: los únicos `example` están en parámetros sueltos.
- `docs/api_doc/swagger.json` está desactualizado: conserva los placeholders `@project.name@`, `@project.description@` y `@project.version@`, y lista rutas `/api/v1/market/offers/...` junto a las de `/api/market/...`. Ninguna prueba ni el build lo regeneran.
- El puerto de Mercado no se publica: las demás partes lo alcanzan por el gateway ([[Gateway e identidad]]). El repositorio del gateway no estaba disponible al hacer esta revisión, así que no se pudo verificar si enruta el contrato.

## Tareas

| Tarea en Taiga | Veredicto | Motivo |
|---|---|---|
| #1019 T01, escribir el contrato de catálogo y compra | Obsoleta | Está hecho: todos los endpoints de negocio están documentados |
| #1020 T02, publicar para verlo desde el navegador | Reescribir como T02 | Está abierto en el servicio, pero falta comprobar que otro equipo llegue a él |
| #1021 T03, errores y compartir con otros equipos | Reescribir como T03 y T04 | Los errores están documentados; falta el export al día y compartirlo |

### T02 (reescrita) - Comprobar el acceso al contrato publicado (3 h)

- Verificar con el equipo de plataforma si el gateway enruta `/swagger-ui.html` y `/v3/api-docs` de Mercado y con qué ruta.
- Revisar que la URL de servidor que declara `SpringDocConfig` sea la que ven los otros equipos.
- Dejar la dirección final donde otro equipo abre el contrato anotada en esta nota y en [[Mapa de servicios]].
- Hecho cuando: una persona de otro equipo abre el contrato desde su entorno, sin acceso directo al puerto de Mercado.

### T03 (reescrita) - Regenerar y versionar el contrato exportado (4 h)

- Reemplazar `docs/api_doc/swagger.json` por un export real de `/v3/api-docs`, sin placeholders y sin las rutas `/api/v1/...`.
- Automatizar el export (plugin de springdoc para Maven o una prueba) y hacer que el CI falle si el archivo versionado difiere del generado.
- Coordinar con [[S2-06 - Plataforma y CI]], que también toca el CI y reemplaza la documentación placeholder de `docs/app_doc`.
- Hecho cuando: el archivo versionado coincide con el contrato que publica el servicio y el CI lo comprueba.

### T04 (nueva) - Ejemplos y validación con otro equipo (3 h)

- Agregar ejemplos de cuerpo (`@ExampleObject`) al publicar una oferta, al comprar y en una respuesta `ErrorApi`.
- Pedir a una persona de otro equipo (por ejemplo, Frontend) que arme un pedido y lea un error usando solo el contrato.
- Compartir la dirección con los equipos que consumen Mercado.
- Hecho cuando: esa persona completa el pedido sin preguntarnos, que es el CA3 de la historia.

Las horas son una propuesta con el margen de ±20 % del resto del plan. No suman al total comprometido mientras la historia no entre al sprint.

## Origen

Revisión de #1010 y #1012 contra el código el 2026-10-02, a pedido del equipo, a partir de [[Revisión del Sprint 2 en Taiga]]. Aplicado en Taiga el 2026-10-02: T01 (#1019) cerrada como obsoleta, T02 (#1020) y T03 (#1021) reescritas y T04 creada (#5346). La historia #1010 no se modificó: su lugar en el sprint depende de [[Q-018 - Alcance real del Sprint 2 en Taiga]].
