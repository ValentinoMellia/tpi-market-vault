## [2026-10-07] lint | Restaurar la nota de documentación OpenAPI
- El merge `85d5801` de la PR #27 dejó vacía [[Documentación OpenAPI]] en `main` (0 bytes), y el lint fallaba por falta de frontmatter y de título H1 en todas las PR. Se restaura el contenido de `f0f970c`, la versión de la PR #27 ya con el encoding reparado. `node scripts/lint-vault.mjs` sin errores.
