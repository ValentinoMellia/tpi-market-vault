---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, convenciones, git]
---
# Git workflow

> Ramas, pull requests y mensajes de commit de `tpi-market`, y quÃ© verifica realmente la integraciÃ³n continua.

## Ramas

| Rama | Uso | Destino del PR |
|---|---|---|
| `main` | ProducciÃ³n | n/a |
| `develop` | IntegraciÃ³n | n/a |
| `feature/*` | Trabajo nuevo | `develop` |
| `fix/*` | Correcciones | `develop` |
| `release/*` | Preparar versiÃ³n | `main` |
| `hotfix/*` | Urgencias | `main` |

`.github/workflows/branching-name-check.yml` valida estos destinos.

## IntegraciÃ³n continua: lo que pasa de verdad

- `verify.yml` corre `mvn verify` solo en PR a `main` o `release/**`; en `develop` no hay verificaciÃ³n ([[Roadmap de trabajo]]).
- `build-and-push.yml` publica la imagen en GHCR y avisa por Discord al empujar a `main`.

## Commits

Conventional commits (`feat:`, `fix:`, `docs:`...). Sin atribuciÃ³n a herramientas de IA ni lÃ­neas `Co-Authored-By` automÃ¡ticas.

## Relacionado
[[Calidad de cÃ³digo]], [[Estado actual del cÃ³digo]].

## Protocolo de Trabajo Iterativo (Agentes de IA)

- **Una iteración no es una orden:** Cuando se propone una solución, se pide explorar alternativas, o se pide un ajuste en el código de forma iterativa, el agente DEBE proponer la solución sin aplicarla ni realizar un commit.
- **Prohibición de Commits no autorizados:** Queda absolutamente prohibido ejecutar git commit, git push o dar por cerrada una tarea de Spec-Driven Development (SDD) sin la confirmación explícita del usuario para realizar ese commit en particular.
