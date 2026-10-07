---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
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

## Commits

Conventional commits (`feat:`, `fix:`, `docs:`...). Sin atribución a herramientas de IA ni líneas `Co-Authored-By` automáticas.

## Relacionado
[[Calidad de código]], [[Estado actual del código]].

## Protocolo de Trabajo Iterativo (Agentes de IA)

- **Una iteración no es una orden:** Cuando se propone una solución, se pide explorar alternativas, o se pide un ajuste en el código de forma iterativa, el agente DEBE proponer la solución sin aplicarla ni realizar un commit.
- **Prohibición de Commits no autorizados:** Queda absolutamente prohibido ejecutar git commit, git push o dar por cerrada una tarea de Spec-Driven Development (SDD) sin la confirmación explícita del usuario para realizar ese commit en particular.
