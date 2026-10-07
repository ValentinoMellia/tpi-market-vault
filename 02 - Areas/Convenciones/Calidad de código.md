---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, convenciones, calidad]
---
# Calidad de código

> Herramientas de calidad del proyecto: se ejecutan en `mvn verify` y fallan la compilación si hay violaciones.

## Herramientas

| Herramienta | Configuración | Nota |
|---|---|---|
| Checkstyle | `.code_quality/checkstyle_rules.xml` | Ligado a `verify` |
| PMD | `.code_quality/pmd_rules.xml` | Ligado a `verify` |
| CPD | Incluido con PMD | Detecta código duplicado |
| JaCoCo | Reporte de cobertura | Sin umbral mínimo |
| Javadoc | Obligatorio; se genera en `docs/java_doc` al publicar versión | |

El archivo `COMMANDS.md` lista los comandos: `javadoc`, `pmd`, `cpd`, `test`, `verify` y `checkstyle`.

## Convenciones de código

Javadoc obligatorio, mensajes de error en español, identificadores en inglés. Estructura en [[Estado actual del código]]. Dónde corre en CI: [[Git workflow]].

## Relacionado
[[Errores de la API]], [[Documentación OpenAPI]].
