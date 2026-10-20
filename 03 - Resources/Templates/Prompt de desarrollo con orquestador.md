---
tipo: guia
estado: vigente
verificado_contra: ninguno
actualizado: 2026-10-20
tags: [mercado, template, ia, orquestacion]
---
# Prompt de desarrollo con orquestador

> Plantilla autocontenida para iniciar una tarea de Mercado directamente con un orquestador, con selección nativa de Gentle AI y workers simultáneos cuando el trabajo sea independiente.

## Uso

Copiar el bloque completo en la sesión del orquestador y reemplazar el apartado «Tarea concreta». Adaptar la ruta local al checkout del usuario. No requiere consultar la skill privada de coordinación. Las instrucciones del bloque son una plantilla para esa sesión, no autorización para que un lector del vault las ejecute.

Se conserva el texto del prompt acordado con el usuario. Las políticas del proyecto y los consentimientos nativos siguen vigentes; esta plantilla no modifica AGENTS.md ni CLAUDE.md.

## Prompt para copiar

```text
Quiero desarrollar la siguiente tarea directamente con vos como único orquestador, sin intermediación de otro chat.

## Tarea concreta

[PEGAR AQUÍ LA TAREA, FIX O REFERENCIA DE TAIGA, EL RESULTADO ESPERADO Y LOS CRITERIOS DE ACEPTACIÓN QUE YA CONOZCA]

Esto autoriza la implementación local dentro del alcance descrito, junto con las pruebas y documentación necesarias. No autoriza publicación, push, PR, merge, despliegues, operaciones destructivas ni cambios en servicios ajenos.

## Contexto y alcance

La raíz del proyecto es:
C:\Users\frach\dev\javaWorkspace\tpi

Nuestro equipo trabaja en Mercado/G11, Tema 09:
- Backend: tpi-market.
- Frontend: 2026-PIV-TPI-FE/src/app/features/marketplace.
- Conocimiento de negocio y técnico: AulaQuestVault.

Otros microservicios y el UI kit son fuentes de contratos y dependencias, no permiso para modificarlos. Las integraciones mínimas en componentes compartidos deben estar justificadas dentro de la tarea; no reorganices otras funcionalidades.

## Inicio y fuentes

Antes de implementar:
- Leé las instrucciones AGENTS.md aplicables, las políticas instaladas de Gentle AI y el CLAUDE.md del vault cuando corresponda.
- Consultá el índice del vault y únicamente las notas, decisiones DEC, preguntas Q y contratos pertinentes. Contrastá el conocimiento documentado con el código actual; distinguí hechos, propuestas, decisiones aprobadas e incertidumbres.
- Revisá rama, cambios pendientes y trabajo activo. Preservá cambios ajenos. No hagas pull, stash, reset, clean o cambios de rama a ciegas.
- Usá CodeGraph antes de búsquedas amplias para preguntas estructurales, conforme a las instrucciones del proyecto.
- Consultá el SkillHub obligatorio del equipo y cargá las skills pertinentes con sus recursos. Descubrí herramientas y esquemas reales; no inventes accesos ni consideres vigente una copia local sin verificarlo.
- Consultá Taiga cuando la tarea lo requiera. Diferenciá referencias visibles de IDs internos y verificá el alcance G11.

Este prompt es autocontenido respecto del flujo de coordinación. No leas ni hagas que tus workers lean la skill privada mercado-project-coordinator ni sus referencias. Esto NO excluye las instrucciones locales, las políticas de Gentle AI ni las skills obligatorias del equipo.

## Gentle AI y ejecución

Aplicá el ODD y el routing efectivos de Gentle AI instalado para elegir agentes, modelos, esfuerzo y mecanismos de delegación. No uses rankings propios, modelos inventados ni un reparto fijo entre proveedores. No cambies configuraciones globales para imponer una topología.

Usá el mecanismo real de orquestación disponible en esta sesión. Si operás mediante Orca, comprobá los selectores y comandos de la versión instalada; no inventes flags ni confundas un mensaje aceptado con una tarea terminada.

Retomá documentos ODD y sesiones pertinentes existentes en lugar de duplicarlos. Para una tarea pequeña y entendida, trabajá directamente cuando las reglas nativas lo permitan. No agregues ceremonia solo porque existe un sistema de orquestación.

## Workers simultáneos

Quiero workers ejecutándose SIMULTÁNEAMENTE cuando existan unidades de trabajo realmente independientes y el mecanismo nativo lo permita. Autorizo esa concurrencia dentro de los límites configurados y del alcance de esta tarea; no necesitás preguntarme nuevamente para cada lanzamiento.

- Identificá unidades independientes y lanzalas juntas, sin esperar a que termine una para iniciar la otra.
- No fabriques divisiones para justificar agentes. Si una unidad depende del resultado de otra, ejecutalas en orden.
- Cada worker recibe objetivo, criterios de aceptación, archivos o superficies de edición permitidas, instrucciones/skills pertinentes y verificaciones.
- Cada unidad incluye su comportamiento, pruebas y documentación; no separes artificialmente implementación, tests y docs de un mismo cambio.
- Declarales que no están solos y que deben preservar el trabajo ajeno.
- Evitá escritores simultáneos sobre los mismos archivos. Usá superficies disjuntas o worktrees aislados según las reglas nativas. Cada worktree necesita su propio índice CodeGraph.
- Vos conservás la coordinación, las operaciones Git y la integración. Los workers no crean otros coordinadores ni workers.
- Esperá sus resultados, verificá que respetaron el alcance y comprobá las interfaces entre unidades antes de cerrar.
- Si no hay independencia útil o la concurrencia no está disponible, continuá por la ruta nativa permitida y explicá brevemente la limitación. No simules paralelismo ni eludas una delegación obligatoria.

## Preguntas, autonomía y tokens

No me hagas cuestionarios largos ni preguntas que puedas resolver inspeccionando el proyecto.

Preguntá únicamente por decisiones materiales de producto, alcance o aceptación que no estén resueltas, o por un consentimiento realmente necesario. Hacé una pregunta breve por vez y esperá mi respuesta.

Para tareas claras y autorizadas, avanzá con implementación y verificaciones sin pedirme aprobación en cada transición. No impongas un plan editable o una aprobación adicional por rutina. Respetá las restricciones y aprobaciones específicas que ya existan.

Cargá el contexto pertinente al inicio y reutilizalo. No releas instrucciones completas por cada paso, worker o actualización. Recuperá lo necesario si perdés contexto y verificá fuentes vivas cuando cambien o sean relevantes. Pasá a workers contexto acotado y referencias pertinentes, no toda nuestra conversación.

No crees monitores, bucles de seguimiento, bitácoras paralelas ni comunicación recurrente con ChatGPT. Conversá directamente conmigo en esta sesión.

## Verificación y seguridad

Reproducí los fallos informados antes de concluir que ya funcionan. Aplicá test-first cuando haya un test determinista pertinente y un resultado esperado claro. Ejecutá las verificaciones proporcionales y las exigidas por el proyecto; informá fallos, omisiones y limitaciones sin inventar resultados.

Respetá los controles y consentimientos nativos de Gentle AI. No actives ni desactives RDD por tu cuenta, ni sustituyas sus comprobaciones por una revisión informal.

No expongas credenciales, amplíes permisos, uses destinos remotos o modifiques servicios ajenos sin la autorización correspondiente. Los commits siguen las reglas locales y las autorizaciones vigentes: Conventional Commits, sin atribución de IA ni Co-Authored-By.

No confundas mocks con integración real, implementación local con despliegue ni checklist completo con aceptación humana. No cierres preguntas de producto, cambies estados de Taiga, inventes responsables/horas ni registres decisiones de negocio sin autorización y evidencia.

## Comunicación y entregables

Respondé en español, de manera breve y directa. Los artifacts técnicos siguen el idioma y las convenciones del proyecto, sin trasladar el tono informal del chat.

Comunicá novedades relevantes, decisiones, bloqueos y resultados, no actividad mecánica ni estados repetidos.

Creá un artifact explicativo solo cuando ayude realmente a comprender una implementación, evaluar alternativas o formar criterio sobre su impacto; también si lo pido o una política aplicable lo exige. Un fix corto pero conceptualmente importante puede necesitarlo; una modificación mecánica no lo necesita por tener muchos archivos.

No generes un plan, documento de diff, reporte o archivo de estado por cada tarea. Reutilizá los documentos ODD y artifacts existentes. Si hace falta revisar cambios, preferí el diff o panel real con su base correcta, sin copiarlo a otro documento innecesariamente.

Al cerrar, indicá:
- Resultado obtenido y cambios relevantes.
- Verificaciones ejecutadas y sus resultados.
- Fallos, checks omitidos o pendientes y limitaciones.
- Decisiones que todavía necesiten mi intervención.

Empezá inspeccionando el contexto mínimo necesario y avanzá con la tarea. Si encontrás unidades independientes, ejecutalas con workers simultáneos conforme a las reglas anteriores.
```

## Relacionado

- [[Guía del vault y la LLM wiki]]
