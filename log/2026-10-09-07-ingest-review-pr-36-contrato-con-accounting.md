## [2026-10-09] ingest | Correcciones de la review de la PR 36 (US-5193)
- [[Estado actual del código]]: `verificado_contra` vuelve a `codigo@7528610`, porque esa nota usa el frontmatter para la última revisión completa. Las verificaciones parciales quedan en sus párrafos "Actualización".
- [[Integración con Accounting]] y [[Hold de monedas]]: `verificado_contra` vuelve a `accounting@develop-2026-10-01`. Un párrafo nuevo dice que el lado de Mercado se verificó contra `e456c55f`. Se reescribe el resumen de [[Integración con Accounting]] para decir qué está alineado y qué falta.
- [[Contrato de avisos de compra]]: se comprobó que en `f7457882` no hay código de avisos (`PURCHASE_FAILED`), así que "el código no cumple este contrato" es cierto en ese commit.
