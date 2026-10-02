---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5225"
puntos: 3
prioridad: Must
horas: 15
---
# S2-06 - Plataforma y CI

> Dejar a Mercado desplegable en la plataforma y verificado en cada PR: CI sobre `develop`, `PORT=8100`, variable de Kafka unificada, `itemValidityDays` fuera y documentación placeholder reemplazada. 5 tareas, 15 h, 3 puntos, Must (cubre los P0 5, 6 y 7).

## [G11] — Plataforma y CI

---

## Descripción (Como / Quiero / Para)

- **Como**: integrante del equipo de Mercado
- **Quiero**: que Mercado se despliegue en la plataforma con la configuración correcta y que cada PR a `develop` se verifique
- **Para**: detectar los errores antes de integrar y que el servicio sea alcanzable por los demás equipos

---

## Notas / Observaciones

- [ ] Reglas de negocio: Mercado corre en el puerto 8100 (gestión 8101) en la plataforma ([[Q-016 - Puerto y registro de Mercado en la plataforma]], [[Mapa de servicios]]). Los ítems no vencen: itemValidityDays se quita de la entidad, el DTO, las validaciones y los datos de demostración ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]).
- [ ] Validaciones: mvn verify corre en todo PR a develop; la variable de Kafka debe ser la que Spring espera (SPRING_KAFKA_BOOTSTRAP_SERVERS) o la plantilla debe mapear KAFKA_SERVERS hacia ella (application-prod.properties, .tpi/platform/).
- [ ] Datos obligatorios: .tpi/platform/.env con PORT=8100; SERVER_PORT=${PORT} en el compose de la plataforma.
- [ ] Performance (tiempos, volumen, límites): el CI debe terminar en un tiempo razonable (objetivo a medir, por ejemplo menos de 10 minutos); KafkaSagaIntegrationTest se omite sin Docker y no debe bloquear.
- [ ] Seguridad (roles, permisos, datos sensibles): no incluir secretos en .compose/.env.example ni en el workflow.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica.
- [ ] Otros: main está 222 commits por detrás de develop (gap 16); no se resuelve acá. docs/app_doc y .tpi/.tpi son placeholders de la plantilla.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: un PR con destino develop dispara mvn verify y el resultado queda como verificación requerida del PR.
- [ ] **CA2**: con PORT=8100 en .tpi/platform/.env, el contenedor expone la aplicación en 8100 y actuator en 8101; GET /actuator/health responde 200 en 8101.
- [ ] **CA3**: con una sola variable de entorno de Kafka definida en la plantilla de plataforma, el perfil prod se conecta al bus y no cae en localhost:9092.
- [ ] **CA4**: no queda ninguna aparición de itemValidityDays en el código ni en los datos de demostración, y las pruebas existentes pasan.
- [ ] **CA5**: docs/app_doc y .tpi/.tpi ya no contienen texto de plantilla y .compose/.env.example refleja las variables vigentes.
- [ ] **Extras (opcional)**: el workflow publica el reporte de pruebas como artefacto.

---

## BDD (mínimo 3 escenarios)

**Característica:** Despliegue y verificación continua de Mercado

**Escenario 1**  

- **Dado**: un PR con rama `feature/*` y destino `develop`
- **Cuando**: se abre o se actualiza el PR
- **Entonces**: el workflow ejecuta `mvn verify` y bloquea el merge si falla

**Escenario 2**  

- **Dado**: la plantilla de `.tpi/platform` con `PORT=8100`
- **Cuando**: se levanta con `up.sh` y se ejecuta `verify.sh`
- **Entonces**: Mercado responde en el puerto 8100 y su gestión en el 8101

**Escenario 3**  

- **Dado**: el perfil `prod` con la variable de Kafka de la plataforma definida
- **Cuando**: la aplicación arranca
- **Entonces**: los listeners de Kafka se conectan al bus (`event-bus:29092` en docker) y el log no muestra `localhost:9092`

**Escenario 4**  

- **Dado**: una oferta publicada con `POST /api/market/courses/{courseId}/catalog/manage` sin `itemValidityDays`
- **Cuando**: se consulta `GET /api/market/courses/{courseId}/catalog/manage`
- **Entonces**: la respuesta no incluye el campo `itemValidityDays` y la oferta se publica con 201

---

## Prototipo

- **Capturas**: No aplica (infraestructura)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `GET /actuator/health` (8101), `POST /api/market/courses/{courseId}/catalog/manage`, `GET /api/market/courses/{courseId}/catalog/manage`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 3
- **Prioridad (MoSCoW / Numérica)**: Must

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|3|Must|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado, `tpi-system-compose` (plataforma), GitHub Actions.
- Módulos afectados: `.github/workflows/verify.yml`, `.tpi/platform/`, `.compose/`, `src/main/resources/application-prod.properties`, `entities/CourseCatalogOfferEntity.java`, `dtos/manage/CatalogOfferPublishDto.java`, `validation/`, `configs/CatalogDataInitializer.java`.
- Otros equipos / aprobaciones: equipo docente de plataforma si la plantilla de compose cambia; hacer `pull` de `tpi-system-compose` antes de verificar el puerto (el clon local estaba 96 commits atrás).
- Impacto en datos / migraciones: la columna `item_validity_days` queda sin uso en bases existentes (`ddl-auto=update` no la elimina); documentarlo.
- Riesgos y mitigación (opcional): quitar `itemValidityDays` toca varias capas; mitigar con una búsqueda global y pruebas de publicación antes del merge. Coordinar con [[S2-03 - Reglas de la tienda]], que también modifica los DTO de publicación.

Relación: [[Git workflow]], [[Estado actual del código]] (gaps 7, 10, 11 y 15), [[Roadmap de trabajo]] (P0 5, 6 y 7; P1).

---

## Tareas

### T01 - Ejecutar el CI en los PR hacia develop

**Objetivo:** Verificar cada PR antes de integrarlo.

- Extender `verify.yml` a los PR hacia `develop`
- Ejecutar `mvn verify` sin secretos en el workflow
- Hecho cuando: un PR hacia `develop` dispara `mvn verify` y su resultado se ve en el PR

Estimación: 3 h

### T02 - Desplegar Mercado con PORT=8100

**Objetivo:** Dejar a Mercado alcanzable en la plataforma con el puerto acordado.

- `pull` de `tpi-system-compose` y `.env` con `PORT=8100`
- Verificación con `verify.sh`
- Hecho cuando: Mercado responde en el puerto 8100 dentro de la plataforma y `verify.sh` pasa

Estimación: 2 h

### T03 - Unificar la variable de Kafka

**Objetivo:** Evitar que el perfil prod ignore la dirección de Kafka.

- Unificar `KAFKA_SERVERS` con `SPRING_KAFKA_BOOTSTRAP_SERVERS` en `application-prod.properties`
- Actualizar la plantilla de `.tpi/platform/`
- Hecho cuando: el perfil `prod` se conecta a Kafka con la variable de la plantilla

Estimación: 3 h

### T04 - Quitar itemValidityDays

**Objetivo:** Eliminar el vencimiento de ítems, que fue descartado.

- Eliminar el campo de la entidad, del DTO y de las validaciones
- Quitarlo de los datos de demostración
- Hecho cuando: no queda ninguna referencia a `itemValidityDays` y las pruebas pasan

Estimación: 4 h

### T05 - Reemplazar la documentación placeholder

**Objetivo:** Sustituir los archivos que quedaron de la plantilla.

- Reemplazar `docs/app_doc` y `.tpi/.tpi` por contenido real de Mercado
- Actualizar `.compose/.env.example`
- Hecho cuando: ningún archivo placeholder queda en el repositorio y `.compose/.env.example` refleja las variables vigentes

Estimación: 3 h
