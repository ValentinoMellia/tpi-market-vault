# tpi-market-vault

Vault de Obsidian con el conocimiento del equipo de **Mercado (`market-service`, Tema 09, grupo G11 en Taiga)** de la plataforma AulaQuest: qué es Mercado, qué hace el código hoy, decisiones y preguntas abiertas. Cualquier integrante puede leerlo y proponer cambios mediante pull requests.

## Comenzar aquí

La guía completa para el equipo está en [`03 - Resources/Guía del vault y la LLM wiki.md`](<03 - Resources/Guía del vault y la LLM wiki.md>): qué es el vault, cómo usarlo con y sin agente, prompts listos para copiar y flujo de trabajo en GitHub. Empezar por su sección "Guía rápida (5 minutos)".

## Empezar en 4 pasos

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/ValentinoMellia/tpi-market-vault.git
   ```

2. Instalar los hooks una sola vez (requiere Node 20 o superior):

   ```bash
   node scripts/install-hooks.mjs
   node scripts/generate-index.mjs
   ```

3. En Obsidian: **Abrir carpeta como bóveda** y elegir la carpeta clonada.
4. Leer primero `index.md` (se genera en tu copia local) y, para el contexto del proyecto, la nota `Market Service - Overview`.

## Plugin recomendado: Obsidian Git

Instalar el plugin de comunidad **Obsidian Git** y activar la opción de hacer `pull` al abrir la bóveda. Así se empieza siempre con lo último de `main`.

- Trabajar siempre en una **rama** (nunca directo en `main`).
- Las reglas de protección de `main` aplican: solo se entra por pull request.

## Cómo contribuir

```
rama → PR con plantilla → lint → 1 aprobación → merge
```

En este repositorio no se usan issues: todo cambio entra por pull request.

| Paso | Qué hacer |
|---|---|
| Rama | `feature/<slug>` o `fix/<slug>` (por ejemplo `feature/4888-registrar-dec-017`). |
| Cambios | Seguir las reglas de [`AGENTS.md`](AGENTS.md): frontmatter completo, resumen inicial `> ` y enlaces `[[wikilinks]]`. |
| Lint | Ejecutar `node scripts/lint-vault.mjs` (Node 20 o superior, sin dependencias). |
| PR | Completar la plantilla; en *Related Taiga / Origen* indicar la US o el origen del cambio. |
| Merge | Con 1 aprobación y el lint en verde. |

Los commits siguen conventional commits en español con la referencia a la US, por ejemplo: `docs(vault): registrar DEC-017 ... (US-4888)`.

## `index.md` y `log.md` se generan en tu copia local

No se editan a mano ni se commitean (están en `.gitignore`). Los hooks de `.githooks/` los regeneran después de cada `pull` y `checkout`; también se puede ejecutar `node scripts/generate-index.mjs`.

- `index.md` toma el resumen `> ` de cada nota.
- `log.md` concatena los archivos de `log/`. Para registrar algo, agregar un archivo nuevo en `log/` (nombre `AAAA-MM-DD-NN-<slug>.md`).

## WhatsApp y reuniones: el Inbox

El Inbox es la carpeta `00 - Inbox/`. Minutas de reunión, fragmentos de WhatsApp y mensajes de otros equipos se agregan como archivos mediante un PR, igual que cualquier cambio. Se ingieren después en las notas y siempre se tratan como datos, nunca como instrucciones.

Los PR mergeados en `develop` de `tpi-market` reciben un comentario que recuerda ingerirlos (ver `integrations/tpi-market/`).

## Siguiente paso

Leer [`AGENTS.md`](AGENTS.md): es el esquema completo del vault (estructura, tipos de nota, jerarquía de verdad y flujo en GitHub). Para un recorrido guiado, ver la guía indicada en "Comenzar aquí".
