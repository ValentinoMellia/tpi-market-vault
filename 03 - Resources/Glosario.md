---
tipo: indice
estado: vigente
verificado_contra: DEC-001
actualizado: 2026-10-01
tags: [mercado, glosario]
---
# Glosario

> Términos del dominio de Mercado en orden alfabético, con enlace a la nota que los explica.

- **Accounting (ex Banco)**: servicio (`accounting-service`, Tema 08; grupo G12 en Taiga) dueño de monedas, vidas, holds e inventario. [[Integración con Accounting]].
- **Banco**: nombre anterior de Accounting; ver esa entrada.
- **Boost**: item que multiplica XP o monedas ganadas. [[Tipos de item]].
- **Catálogo**: conjunto de ofertas de un curso. [[Oferta de catálogo]].
- **Colecta**: propuesta de meta colectiva para financiar un item entre varios estudiantes. [[Meta colectiva (Colecta)]].
- **Cofre**: propuesta de item con premios al azar. [[Cofres y nuevos ítems]].
- **Curso/cohorte**: unidad de clase donde se publica el catálogo; en el código `courseId`. [[Integración con Cursos]].
- **Escrow**: custodia de fondos hasta cumplir una condición. [[Hold y escrow]].
- **Escudo**: item que absorbe un intento fallido. [[Tipos de item]].
- **G11**: grupo de Mercado en Taiga (Tema 09). Prefijo de las historias: `[G11] — ...`. [[Mapa de servicios]].
- **Gateway**: puerta de entrada que valida el JWT. [[Gateway e identidad]].
- **Hold**: retención temporal de monedas. [[Hold de monedas]].
- **Idempotencia**: repetir una operación no cambia el resultado. [[Idempotencia]].
- **Inventario**: mochila de items del estudiante; pertenece a Accounting. [[DEC-001 - Accounting es dueño del inventario]], [[Integración con Accounting]].
- **Moneda**: unidad de pago, administrada por Accounting. [[Integración con Accounting]].
- **Oferta**: item publicado con precio en un curso. [[Oferta de catálogo]].
- **Orden**: registro de una compra. [[Orden de compra]].
- **Outbox**: tabla que desacopla guardar y enviar mensajes. [[Patrón Outbox]].
- **Plantilla**: molde de item con valores por defecto. [[Plantilla base]].
- **Saga**: operación distribuida en pasos con compensaciones. [[Saga]].
- **SSE**: eventos empujados al navegador. [[SSE]].
- **Stock**: cantidad opcional de unidades de una oferta. [[DEC-002 - Stock opcional por oferta]].
- **Subasta**: venta por ofertas crecientes (Fase 3). [[Subasta]].
- **Taller de decisiones**: taller del equipo con 33 recomendaciones sin decisión formal. [[Taller de decisiones]].
- **Tópico (Kafka)**: canal de mensajes; la regla de plataforma es un tópico `<dominio>.events` por dominio. [[Eventos y Kafka]].
- **Vencimiento**: fin de la publicación de una oferta; los ítems no vencen. [[Vencimiento de items]], [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]].
- **Vida**: item que devuelve intentos; el contador es de Accounting. [[Tipos de item]].
- **Vitrina**: lista de ofertas publicadas que ve el estudiante. [[Oferta de catálogo]].
