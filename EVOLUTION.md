# Nota de evolución — Tasks API

## Introducción

La solución actual permite ejecutar la aplicación de forma reproducible 
en cualquier entorno con Docker instalado. Esta nota describe cómo 
evolucionaría esta base hacia un entorno más seguro, monitoreado, 
escalable y mantenible.

## Seguridad

La API actualmente no implementa autenticación. Como primera mejora 
agregaría validación de API Key en un middleware de Express — cada 
request debería incluir una clave conocida únicamente por el equipo, 
que el servidor verifica antes de procesar la solicitud.

Para un sistema más robusto, integraría un proveedor de identidad como 
Auth0, que permite gestionar usuarios, roles y permisos de forma 
centralizada implementando estándares como OAuth2 y JWT, sin necesidad 
de construir autenticación desde cero.

Las credenciales que hoy viven en el archivo `.env` deberían migrarse 
a un servicio de gestión de secrets como AWS Secrets Manager. De esta 
forma las credenciales nunca están en el servidor ni en el repositorio 
— viven en un servicio dedicado con acceso controlado y auditable. 
El código no cambia: sigue leyendo variables de entorno, pero la fuente 
de esas variables pasa a ser el secrets manager en lugar de un archivo.

## Monitoreo y observabilidad

Hoy la aplicación no tiene visibilidad sobre lo que ocurre en producción. 
Implementaría AWS CloudWatch para centralizar los logs de los contenedores 
y configurar alertas automáticas ante errores o caídas del servicio. 
Esto permite diagnosticar problemas sin necesidad de conectarse 
directamente al servidor, y detectar degradación antes de que los 
usuarios lo reporten.

## Escalabilidad

La arquitectura actual corre en un único servidor. Para soportar mayor 
tráfico aplicaría escalabilidad horizontal: múltiples instancias de la 
aplicación corriendo en paralelo, con un load balancer distribuyendo 
el tráfico entre ellas. Esto permite crecer agregando servidores sin 
modificar la aplicación ni su configuración.

Esta arquitectura es posible porque la app es stateless — no guarda 
estado en memoria entre requests. El estado vive únicamente en 
PostgreSQL, que puede ser compartido por todas las instancias.

## Mantenibilidad

El pipeline de CI/CD actual valida que el código pase los checks antes 
de llegar a `main`, con branch protection que impide mergear sin que 
el CI esté verde. Para evolucionar esto:

- **Tests reales** — agregaría tests con Jest que validen el comportamiento 
  de cada endpoint. El equipo de desarrollo podría ver exactamente qué 
  falló en el pipeline y corregirlo de forma autónoma sin intervención 
  del equipo de operaciones.

- **Migraciones automáticas** — los cambios en el esquema de la base de 
  datos (nuevas tablas, columnas) se manejarían con un sistema de 
  migraciones que corre automáticamente como parte del deploy. Hoy la 
  app crea la tabla al arrancar con `CREATE TABLE IF NOT EXISTS`, lo cual 
  funciona para desarrollo pero no es sostenible cuando el esquema evoluciona.

- **Deploy automático** — el pipeline está preparado para conectarse a un 
  servidor de producción vía SSH o self-hosted runner. Para activarlo 
  se necesita configurar los secrets `SERVER_HOST`, `SERVER_USER` y 
  `SSH_PRIVATE_KEY` en GitHub y completar el job de deploy en el workflow.