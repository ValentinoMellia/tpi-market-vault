# Integración con tpi-market

El workflow [`notify-vault.yml`](notify-vault.yml) deja un comentario en cada PR de `tpi-market` que se mergea en `develop`. El comentario recuerda ingerir el cambio en el vault e incluye un prompt listo para copiar y pegar en el agente.

**Este workflow no está aplicado todavía.** Vive acá para copiarlo al repositorio de código cuando el equipo lo decida.

## Instalación

1. Copiar `notify-vault.yml` a `.github/workflows/notify-vault.yml` en `tpi-market`.
2. No hace falta ningún secreto ni token entre repositorios: el workflow usa el `GITHUB_TOKEN` de `tpi-market` con el permiso `pull-requests: write`.
3. Si la organización restringe los permisos del `GITHUB_TOKEN` por defecto, el permiso `pull-requests: write` declarado en el workflow es suficiente; no hay que cambiar la configuración global.

## Cómo comprobar que funciona

1. Mergear un PR pequeño en `develop`.
2. Revisar que aparezca el comentario "Ingesta en el vault" en ese PR, con el prompt que incluye su número.
3. Si falla, mirar el log de la ejecución en la pestaña Actions de `tpi-market`.

## Cómo se usa el comentario

1. Copiar el prompt del comentario.
2. Abrir un agente en la carpeta del vault y pegarlo (ver `03 - Resources/Guía del vault y la LLM wiki.md`).
3. Revisar el diff, ejecutar el lint y abrir un PR en el vault. En la sección *Related Taiga / Origen* se indica el PR de `tpi-market`.

## Notas de seguridad

- No se usa ningún secreto: no hay token con acceso al vault que pueda filtrarse.
- El único dato que entra al mensaje es el número del PR (un entero). El título, la rama y el autor no se usan.
- Los PR desde forks se ignoran.
