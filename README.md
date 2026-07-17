# Veng Challenge — Tasks API

API REST para gestión de tareas, desarrollada como desafío técnico de preparación operativa de una aplicación Backend.

## Stack tecnológico

- **Runtime:** Node.js 20
- **Framework:** Express
- **Base de datos:** PostgreSQL 16
- **Contenedores:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

## Cómo levantar el proyecto

**Requisitos:** tener Docker instalado.

```bash
git clone https://github.com/nachova1/Veng-Challenge.git
cd tasks-api
cp .env.example .env
```

Completar las variables en `.env`:

```
DB_USER=taskuser
DB_PASSWORD=taskpass123
DB_NAME=tasksdb
DB_HOST=postgres
```

Levantar el proyecto:

```bash
docker compose up --build
```

La API queda disponible en `http://localhost:3000`.

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /tasks | Listar todas las tareas |
| POST | /tasks | Crear una tarea |
| PUT | /tasks/:id | Marcar tarea como completada |
| DELETE | /tasks/:id | Eliminar una tarea |

**Ejemplos:**

```bash
# Crear tarea
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primera tarea"}'

# Listar tareas
curl http://localhost:3000/tasks

# Marcar como completada
curl -X PUT http://localhost:3000/tasks/1

# Eliminar
curl -X DELETE http://localhost:3000/tasks/1
```

## Decisiones técnicas

**Docker y Docker Compose** — el objetivo principal era que la aplicación pudiera ejecutarse de forma reproducible en cualquier entorno Linux. Docker garantiza que las dependencias, configuración y entorno de ejecución estén completamente encapsulados. Con un solo comando cualquier integrante del equipo puede levantar el proyecto sin instalar Node ni PostgreSQL localmente.

**Multi-stage build** — el Dockerfile usa dos etapas: una de build (donde se instalan dependencias) y una de producción (donde solo va lo necesario para correr la app). Esto reduce el tamaño de la imagen final significativamente y elimina herramientas innecesarias del entorno de producción.

**Volúmenes para persistencia** — los datos de PostgreSQL se persisten en un volumen Docker (`postgres_data`). Esto garantiza que los datos sobrevivan reinicios y recreaciones del contenedor, separando el ciclo de vida de los datos del ciclo de vida de la infraestructura.

**Healthchecks y depends_on** — el servicio de la app espera a que PostgreSQL esté realmente listo antes de arrancar, no solo que el contenedor esté corriendo. Esto evita errores de conexión al inicio que son comunes sin esta configuración.

**Variables de entorno** — las credenciales y configuración sensible se manejan a través de variables de entorno definidas en `.env`, que no se commitea al repositorio. El archivo `.env.example` sirve como plantilla para nuevos integrantes del equipo.

**GitHub Actions con branch protection** — se configuró un pipeline de CI que corre en cada push a `develop` y `main`. La rama `main` tiene branch protection activada: no acepta pushes directos, solo Pull Requests que hayan pasado el CI. Esto simula un flujo de trabajo profesional donde los cambios pasan por validación antes de llegar a producción.

## Supuestos

- Se asume que el entorno de ejecución tiene Docker instalado.
- No se implementó autenticación ya que el foco del desafío es la preparación operativa, no la lógica de negocio.
- La creación de la tabla se hace automáticamente al arrancar la app (`CREATE TABLE IF NOT EXISTS`), asumiendo que en producción esto sería manejado por un sistema de migraciones.

## Límites conocidos y problemas pendientes

- Los tests actuales son un placeholder (`echo`). En una siguiente iteración se agregarían tests con Jest.
- No hay manejo de errores para requests con body inválido (por ejemplo, crear una tarea sin `title`).
- El pipeline de CD está preparado para conectarse a un servidor 
  de producción vía SSH o self-hosted runner. Para activarlo 
  se necesita configurar los secrets SERVER_HOST, SERVER_USER 
  y SSH_PRIVATE_KEY en GitHub y descomentar el job de deploy 
  en el workflow.