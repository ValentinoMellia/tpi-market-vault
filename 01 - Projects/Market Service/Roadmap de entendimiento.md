---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, onboarding]
---
# Roadmap de entendimiento

> Camino de lectura ordenado para quien se suma al equipo. Seis etapas; al final de cada una deberías poder responder lo que se indica.

## Etapa 0. Cómo funciona este vault

Leer: [[Guía del vault y la LLM wiki]] (clonar, instalar hooks, usar Obsidian y el agente, flujo de PR).
Deberías entender: cómo leer y proponer cambios en el vault antes de empezar con el contenido.

## Etapa 1. Qué es Mercado

Leer: [[Market Service - Overview]], [[Mapa de servicios]], [[Glosario]].
Deberías entender: qué vende Mercado, a quién, y qué responsabilidades pertenecen a otros equipos.

## Etapa 2. El dominio

Leer: [[Plantilla base]], [[Tipos de item]], [[Oferta de catálogo]], [[Orden de compra]], [[Hold de monedas]].
Deberías entender: la diferencia entre plantilla y oferta, qué datos fija el profesor y cómo cambia de estado una orden.

## Etapa 3. La compra y la saga

Leer: [[Saga]], [[Idempotencia]], [[Hold y escrow]], [[Patrón Outbox]], [[SSE]], [[Bloqueo optimista]].
Deberías entender: por qué la compra responde 202, qué orden de pasos usa hoy el código (entregar y luego cobrar, en discusión en [[Q-008 - Orden de la saga de compra]]) y cómo se evita cobrar dos veces.

## Etapa 4. Integraciones

Leer: [[Gateway e identidad]], [[Integración con Accounting]] (monedas, vidas e inventario; la más importante), [[Integración con Cursos]], [[Integración con Users]], [[Integración con Notificaciones]], [[Integración con Backoffice]], [[Eventos y Kafka]], [[Entrega at-least-once y deduplicación]].
Deberías entender: qué mensajes intercambia Mercado con cada vecino, cuáles son simulados hoy y en qué difiere el contrato de Mercado del de Accounting.

## Etapa 5. Accounting, taller y propuestas

Leer: [[DEC-001 - Accounting es dueño del inventario]], [[Q-007 - Contrato con Accounting]], [[Q-008 - Orden de la saga de compra]], [[Taller de decisiones]], [[Meta colectiva (Colecta)]] y [[Cofres y nuevos ítems]].
Deberías entender: por qué el inventario es de Accounting, cuál es la decisión de integración que sigue abierta (el orden de la saga), qué recomendó el taller sin decidirlo y qué propuestas de producto existen pero no están aprobadas.

## Etapa 6. Estado y pendientes

Leer: [[Estado actual del código]], [[Errores de la API]], [[Calidad de código]], [[Git workflow]], las preguntas abiertas (ver [[index]]), [[Backlog - Índice]], [[Ideas descartadas]] y [[Roadmap de trabajo]].
Deberías entender: qué funciona, qué es simulado, qué está en disputa y qué sigue.
