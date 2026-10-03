---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-03
tags: [mercado, convenciones, git]
---
# Git workflow

> Ramas, pull requests y mensajes de commit de `tpi-market`, y qué verifica realmente la integración continua.

## Ramas

| Rama | Uso | Destino del PR |
|---|---|---|
| `main` | Producción | n/a |
| `develop` | Integración | n/a |
| `feature/*` | Trabajo nuevo | `develop` |
| `fix/*` | Correcciones | `develop` |
| `release/*` | Preparar versión | `main` |
| `hotfix/*` | Urgencias | `main` |

`.github/workflows/branching-name-check.yml` valida estos destinos.

## Integración continua: lo que pasa de verdad

- `verify.yml` corre `mvn verify` solo en PR a `main` o `release/**`; en `develop` no hay verificación ([[Roadmap de trabajo]]).
- `build-and-push.yml` publica la imagen en GHCR y avisa por Discord al empujar a `main`.

- La verificación del nombre de rama corre solo al abrir la PR (`types: [opened]`) hacia `main` o `develop`; si se cambia el destino después, no se vuelve a ejecutar.

## Reglas del repositorio `tpi-market`

Salen del `AGENTS.md` de `tpi-market` (verificado el 2026-10-03):

- **Destino de las PR.** Una PR desde `feature/*` o `fix/*` va siempre a `develop`. `main` solo recibe PR desde `release/*` o `hotfix/*`. El 2026-10-03 la PR #87 se abrió desde `feature/us-5193-t01-persist-orderRef-UUID` hacia `main` y se cerró para reabrirla como #88 hacia `develop`.
- **Plantilla completa.** Toda PR completa la plantilla de `.github/pull_request_template.md` sin dejar comentarios de relleno: título convencional `<tipo>(<alcance>): <descripción> (<HU / Tareas>)`, encabezado, Description, Related Issue (épica, historia y tareas de Taiga), Motivation and Context, How Has This Been Tested? (entorno, `mvn test`, Checkstyle, PMD) y el checklist con cada ítem tildado. La PR #88 dejó el checklist sin tildar.
- **Calidad.** Java 21 con `mvn checkstyle:check`, `mvn pmd:check` y `mvn javadoc:javadoc` (ver [[Calidad de código]]).

## Javadoc generado

`COMMANDS.md` §1 pide generar `docs/java_doc` (`mvn javadoc:javadoc`) **solo en ramas de release**. Las PR #78, #82, #84 y #85 lo versionaron igual, con cientos de archivos generados cada una; #84 y #85 ya chocan entre sí por eso. La excepción correcta es la de la PR #86, que corre el comando y no incluye los archivos ([[Revisión de PRs abiertas (2026-10-03)]]).

## Commits

Conventional commits (`feat:`, `fix:`, `docs:`...). Sin atribución a herramientas de IA ni líneas `Co-Authored-By` automáticas.

## Relacionado
[[Calidad de código]], [[Estado actual del código]], [[Revisión de PRs abiertas (2026-10-03)]].
