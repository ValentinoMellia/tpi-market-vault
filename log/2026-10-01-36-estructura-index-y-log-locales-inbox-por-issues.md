## [2026-10-01] estructura | Index y log locales, Inbox por issues
- `index.md` y `log.md` dejan de commitearse: se generan en local con hooks (`.githooks/`, `scripts/install-hooks.mjs`) y en el workflow de lint.
- Se quitaron los workflows de generación y de captura al Inbox: el Inbox pasa a ser los issues `captura`/`minuta`, tratados como datos no confiables y solo de colaboradores.
- Se endurecieron los workflows (timeouts, comentarios solo al abrir, `persist-credentials: false`), la integración con `tpi-market` y se agregó Dependabot.
