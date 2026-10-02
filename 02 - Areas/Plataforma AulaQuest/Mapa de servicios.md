---
tipo: indice
estado: vigente
verificado_contra: equipo-plataforma@2026-10-01
actualizado: 2026-10-01
tags: [plataforma, servicios]
---
# Mapa de servicios

> Qué servicios forman AulaQuest, quién los mantiene y cómo se relaciona cada uno con Mercado. Información tomada de los repositorios de la plataforma, del repositorio de accounting y de la documentación del equipo al 2026-10-01.

| Servicio | Tema/Grupo | Propósito | Puerto (gestión) | Repositorio | Relación con Mercado |
|---|---|---|---|---|---|
| `users-service` | Tema 01 | Identidad, autenticación, emite JWT y sirve JWKS | 8082 (8083) | `tpi-users` | [[Integración con Users]] |
| `course-service` | Tema 02 | Cursos, cohortes, inscripciones, secciones, cuestionarios | 8086 (8087) | `tpi-course` | [[Integración con Cursos]] |
| Motor de Desafíos | Tema 03 o 05 (inconsistente en las fuentes) | Resolución de desafíos | sin dato | sin dato | Indirecta ([[Q-011 - Efectos y consumo de items]]) |
| `accounting-service` (ex Banco) | Tema 08 (Taiga: G12) | Monedas, vidas, holds, libro contable e **inventario** ([[DEC-001 - Accounting es dueño del inventario]]) | 8090 (8091), prefijo `/api/accounting` | `2026-P4-BE/tpi-accounting` | [[Integración con Accounting]] |
| `market-service` | Tema 09 (Taiga: G11) | Catálogo y compras | 8100 (gestión 8101) | `tpi-market` | Este proyecto; verificado en [[Q-016 - Puerto y registro de Mercado en la plataforma]] |
| Roadmap | Tema 10 | Progreso del estudiante; pide equipar y desequipar items | sin dato | sin dato | Indirecta ([[Integración con Accounting]]) |
| Notificaciones | Tema 11 | Avisos al usuario; define el estándar de Kafka | sin dato | sin dato | [[Integración con Notificaciones]] |
| Backoffice | Tema 12 | Parámetros administrables | sin dato | sin dato | [[Integración con Backoffice]] |
| `api-gateway` | Plataforma | Entrada única, JWT, enrutamiento | 8080 (8081), no publicado | `tpi-api-gateway` | [[Gateway e identidad]] |
| Frontend y UI Kit | Plataforma | Angular 22+ (zoneless, Signals) y biblioteca `@2026-p4-fe/ui` | n/a | `2026-PIV-TPI-FE`, `2026-PIV-TPI-UI-KIT` | Consume la API de Mercado |

No existe un servicio de inventario ni un "Grupo 12" dueño de inventario: el inventario es de Accounting ([[Ideas descartadas]]).

## Infraestructura compartida

El repositorio `tpi-system-compose` levanta nginx, webapp, Eureka, MySQL, Redis, `jwt-keys`, `users-service`, `api-gateway`, Prometheus y Grafana. El bus de eventos es `apache/kafka:4.1.0` bajo el perfil `kafka` (`event-bus:29092`, sin autenticación); el Grupo 2 es dueño del broker real y de notificaciones.

## Tópicos de Kafka aprovisionados

Según el README de la documentación del equipo, la plataforma aprovisiona estos tópicos, cada uno con su `.DLT`, 3 particiones y creación automática desactivada:

| Tópico | Dominio |
|---|---|
| `market.events` | Mercado |
| `accounting.events` | Accounting |
| `notifications.events` | Notificaciones |
| `courses.events` | Cursos |
| `users.events` | Users |

El compose de la plataforma tiene la creación automática activada: eso contradice el README y queda por verificar con el equipo docente. Mercado publica en `market.events` y habla con Accounting por `accounting.events` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Nombres como `bank.holds.*`, `inventory.items.*`, `market.orders.events`, `market.auctions.events` y `notifications.alerts` fueron propuestas de diseño que nunca se aprovisionaron. Regla de plataforma: **un dominio = un tópico `<dominio>.events`** ([[Eventos y Kafka]]).

## Inconsistencias conocidas

- Puerto de Mercado: **8100** en la plataforma (`registry/services.yml` upstream, equipo `market`; gestión 8101 = puerto + 1). El 8084 del código (gestión 8085) es solo el valor por defecto local; 8092 y el equipo `g09` provienen de un clon local de `tpi-system-compose` atrasado 96 commits. En el `platform.env` y el `micros.yml` generados upstream, Mercado está en `GATEWAY_ALLOWLIST` y en la red `tpi-market` ([[Q-016 - Puerto y registro de Mercado en la plataforma]]).
- El registro declara que Mercado ofrece `market.catalog.read` pero no declara necesidades; debería necesitar `course.enrollment.read`.
- Numeración de temas: el Motor de Desafíos aparece como Tema 03 y como Tema 05.
- Numeración de equipos: el número de tema y el grupo de Taiga son distintos. Mercado es Tema 09 y grupo G11; Accounting es Tema 08 y grupo G12 (verificado en la wiki y los sprints de Taiga el 2026-10-01). Las historias se titulan con el grupo: `[G11] — ...`.
- Nombre de la materia: Programación IV en la mayoría de las fuentes y Metodología de Sistemas I en una de ellas.

Ver [[Market Service - Overview]] y [[Eventos y Kafka]].
