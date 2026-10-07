## [2026-10-06] lint | Reparar `main` tras el PR #20
- `node scripts/lint-vault.mjs` sobre `main` daba 3 errores desde el PR #20: wikilinks rotos en [[Git workflow]] y [[Documentación OpenAPI]] huérfana.
- [[Git workflow]]: se quitó el BOM y se deshizo la doble codificación de los acentos (los wikilinks `[[Calidad de código]]` y `[[Estado actual del código]]` volvieron a resolver). El texto previo al PR #20 quedó intacto y se conservó la sección "Protocolo de Trabajo Iterativo (Agentes de IA)".
- [[Documentación OpenAPI]]: se reconstruyó el texto, porque PowerShell había interpretado los acentos graves como escapes (`` `t ``, `` `n ``, `` `0 ``, `` `v ``) y rompió identificadores y bloques de código.
- Se enlazó [[Documentación OpenAPI]] desde [[Market Service - Overview]] para que deje de ser una nota huérfana.
- Resultado: 107 notas revisadas, sin errores.
