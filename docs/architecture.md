# Arquitectura del Sistema

Este documento describe la arquitectura actual del sistema de gestión de asistencia, las responsabilidades de cada capa y las reglas para incorporar nuevos cambios.

La arquitectura debe mantenerse simple, predecible y consistente con las decisiones existentes del proyecto.

---

## Responsabilidad de validaciones por capa

Cada validación debe realizarse en la capa que corresponda. Se debe evitar repetir la misma validación en múltiples capas sin una razón explícita.

### Route / API

La capa HTTP valida la forma y estructura de los datos recibidos.

Ejemplos:

- campos obligatorios;
- strings vacíos;
- formato de email;
- formato de fechas;
- longitud y formato de teléfono;
- parámetros HTTP;
- estructura básica del body.

Cuando una validación de formato ya está garantizada por esta capa, no debe repetirse dentro del Use Case salvo que exista una razón de dominio explícita.

### Middleware

Los middleware son responsables de aspectos transversales de la petición.

Ejemplos:

- autenticación;
- autorización por rol;
- procesamiento de errores de validación.

Las reglas de autorización deben ser aplicadas en backend y no depender únicamente del frontend.

### Controller

El Controller adapta la petición HTTP al Input esperado por el Use Case.

Debe:

- extraer parámetros;
- seleccionar los campos permitidos;
- construir el Input;
- ejecutar el Use Case;
- transformar el resultado en una respuesta HTTP.

Cuando una operación solo permite modificar determinados campos, se debe preferir construir explícitamente el objeto de actualización con esos campos antes que mantener listas complejas de campos prohibidos.

El Controller no debe implementar reglas de negocio.

### Use Case

El Use Case contiene las reglas necesarias para ejecutar una acción del sistema.

Ejemplos:

- verificar que una entidad exista;
- verificar que una entidad esté activa cuando la operación lo requiera;
- comprobar restricciones de negocio;
- detectar conflictos con otras entidades;
- coordinar operaciones de persistencia.

El Use Case no debe repetir validaciones puramente HTTP o de formato que ya fueron realizadas por la capa de entrada.

Ejemplo:

- `email tiene formato válido` → Route/API.
- `email ya pertenece a otro participante` → Use Case.

### Service / Repository / DatabaseService

Esta capa se encarga del acceso y persistencia de datos.

No debe contener validaciones HTTP.

Puede garantizar restricciones relacionadas directamente con persistencia e integridad de datos.

## Evitar duplicación entre capas

Una misma validación no debe implementarse en múltiples capas salvo que exista una razón explícita.

Antes de agregar una validación, determinar si corresponde a:

1. formato o estructura de entrada;
2. autenticación/autorización;
3. adaptación de datos;
4. regla de negocio;
5. integridad/persistencia.

La validación debe implementarse en la capa responsable.

## Consistencia con implementaciones existentes

Antes de diseñar o implementar una nueva operación, revisar casos similares existentes en el proyecto.

Se debe preferir:

- el patrón arquitectónico existente;
- el nivel de abstracción existente;
- una complejidad comparable;
- reutilizar mecanismos existentes;
- la solución más simple que cumpla los requisitos.

No introducir helpers, abstracciones, errores, validaciones o capas adicionales salvo que exista una necesidad concreta.

Si una implementación nueva requiere considerablemente más complejidad que otra operación equivalente existente, debe existir una regla de negocio o requisito que justifique esa diferencia.

## 1. Estructura general

El proyecto utiliza un monorepo con dos aplicaciones independientes:

```text
/
├── backend/
├── frontend/
├── docs/
├── specs/
├── .opencode/
├── AGENTS.md
└── MEMORY.md
```

### Backend

Responsable de:

* lógica de aplicación
* reglas de negocio
* autenticación y autorización
* acceso a datos
* API HTTP
* persistencia en PostgreSQL

Tecnologías principales:

* Node.js
* TypeScript
* Express
* TypeORM
* PostgreSQL

### Frontend

Responsable de:

* interfaz de usuario
* navegación
* interacción con el usuario
* consumo de la API
* estado de la aplicación
* presentación de datos

Tecnologías principales:

* React
* TypeScript
* Vite

---

# 2. Arquitectura del Backend

El backend separa el dominio de la infraestructura y comunicación con el exterior.

```text
backend/
└── src/
    ├── domain/
    └── server-app/
```

## 2.1 `domain/`

Contiene los conceptos y reglas propias del negocio.

Ejemplos:

* entidades
* casos de uso
* errores de dominio
* interfaces necesarias para abstraer infraestructura
* reglas de negocio

El dominio no debe depender de Express, TypeORM ni de detalles específicos de HTTP.

### Regla principal

El dominio debe poder expresar las operaciones del sistema sin conocer cómo llegan las peticiones HTTP ni cómo se almacenan físicamente los datos.

---

## 2.2 `server-app/`

Contiene la infraestructura y los mecanismos necesarios para ejecutar la aplicación.

Incluye responsabilidades como:

* Express
* rutas
* controllers
* middleware
* autenticación
* autorización
* persistencia
* TypeORM
* configuración de la aplicación
* comunicación HTTP

Esta capa puede depender del dominio.

El dominio no debe depender de `server-app/`.

---

# 3. Flujo de una petición

El flujo general de una operación HTTP es:

```text
HTTP Request
     ↓
Route
     ↓
Middleware
     ↓
Controller
     ↓
Use Case
     ↓
Service / Repository
     ↓
Database
```

La respuesta sigue el camino inverso:

```text
Database
     ↓
Service / Repository
     ↓
Use Case
     ↓
Controller
     ↓
HTTP Response
```

Cada capa tiene una responsabilidad específica.

---

## 3.1 Route

Las rutas definen:

* método HTTP
* endpoint
* middleware aplicable
* controller que debe ejecutarse

Las rutas no deben contener lógica de negocio.

Ejemplo conceptual:

```text
POST /users/create/coordinator
        ↓
authenticate
        ↓
authorize
        ↓
createCoordinatorController
```

---

## 3.2 Middleware

Los middleware manejan preocupaciones transversales de la aplicación.

Ejemplos:

* autenticación
* autorización
* validación
* manejo de información de la petición

Un middleware no debe implementar reglas de negocio que correspondan a un caso de uso.

---

## 3.3 Controller

El controller es responsable de adaptar HTTP hacia la aplicación.

Debe encargarse principalmente de:

* recibir la petición
* obtener y validar los datos necesarios
* invocar el caso de uso correspondiente
* transformar el resultado en una respuesta HTTP
* manejar errores según el mecanismo definido por la aplicación

El controller **no debe contener lógica de negocio**.

No debe decidir, por ejemplo:

* si un usuario puede realizar una operación
* cómo se calcula una asistencia
* cómo se determina una regla del dominio
* cómo se persiste una entidad

Esas decisiones pertenecen a las capas correspondientes.

---

## 3.4 Use Case

Los casos de uso representan operaciones que el sistema permite realizar.

Ejemplos:

```text
CreateUser
GetUsersByRole
GetLocationById
CreateAttendance
GetAttendanceHistory
```

Un caso de uso:

* coordina la operación
* aplica las reglas necesarias
* utiliza las abstracciones requeridas
* no depende de Express
* no debe conocer detalles de HTTP

La lógica de aplicación debe estar concentrada en los casos de uso y no duplicarse entre controllers.

---

## 3.5 Service / Repository

Estas capas abstraen operaciones de infraestructura necesarias por los casos de uso.

Pueden encargarse de:

* persistencia
* consultas
* operaciones sobre entidades
* integración con servicios externos

Los casos de uso no deben acceder directamente a detalles concretos de la infraestructura cuando exista una abstracción establecida para hacerlo.

No se debe introducir una nueva abstracción si una existente puede resolver correctamente el problema.

---

# 4. Base de datos

La aplicación utiliza PostgreSQL como sistema de persistencia.

TypeORM se utiliza como ORM.

Las entidades y relaciones de la base de datos deben mantenerse alineadas con el dominio.

Los cambios estructurales deben realizarse mediante el mecanismo de migraciones definido por el proyecto.

No se deben realizar modificaciones manuales o destructivas de la estructura de la base de datos como solución rápida a una funcionalidad.

La estructura detallada de entidades, relaciones y migraciones se documenta en:

```text
docs/database.md
```

---

# 5. Autenticación y autorización

La autenticación y autorización forman parte de la arquitectura transversal del backend.

El flujo general es:

```text
Request
   ↓
Authentication
   ↓
Authorization
   ↓
Controller
   ↓
Use Case
```

Las rutas protegidas deben mantener los middleware de autenticación y autorización correspondientes.

No se debe eliminar ni evitar un mecanismo de autorización para hacer funcionar una funcionalidad.

Las reglas específicas relacionadas con usuarios, roles y permisos se documentan en:

```text
docs/domain.md
```

---

# 6. Arquitectura del Frontend

El frontend utiliza React + TypeScript + Vite.

La estructura principal se organiza dentro de `src/`:

```text
frontend/
└── src/
    ├── api/
    ├── app/
    ├── context/
    ├── features/
    ├── layout/
    ├── lib/
    ├── shared/
    └── types/
```

Cada directorio tiene una responsabilidad específica.

---

## 6.1 `api/`

Contiene la comunicación con el backend.

Responsabilidades:

* llamadas HTTP
* configuración relacionada con la API
* funciones para consumir endpoints

Los componentes de UI no deben duplicar directamente la lógica de comunicación con la API.

---

## 6.2 `app/`

Contiene la configuración principal de la aplicación.

Puede incluir:

* configuración de rutas
* providers
* configuración global
* inicialización de la aplicación

---

## 6.3 `context/`

Contiene contextos globales de React cuando el estado necesita compartirse entre distintas partes de la aplicación.

No utilizar Context para cualquier estado local.

Antes de crear un nuevo Context, comprobar si el estado realmente necesita ser global.

---

## 6.4 `features/`

Contiene funcionalidades organizadas por dominio o característica.

Una feature debe agrupar el código relacionado con una funcionalidad concreta en lugar de distribuirlo arbitrariamente por todo el proyecto.

Ejemplos conceptuales:

```text
features/
├── users/
├── locations/
└── attendance/
```

La estructura exacta debe respetar las convenciones ya existentes en el proyecto.

---

## 6.5 `layout/`

Contiene componentes relacionados con la estructura general de la interfaz.

Ejemplos:

* layouts
* navegación
* estructura general de páginas

---

## 6.6 `lib/`

Contiene utilidades o funciones compartidas que no pertenecen directamente a una feature específica.

Antes de crear una utilidad nueva, buscar primero si existe una función reutilizable.

---

## 6.7 `shared/`

Contiene elementos reutilizables entre distintas partes del frontend.

Puede incluir:

* componentes UI
* estilos
* utilidades compartidas
* elementos visuales comunes

No colocar aquí una funcionalidad que pertenezca exclusivamente a una feature.

---

## 6.8 `types/`

Contiene tipos TypeScript compartidos por distintas partes del frontend.

Los tipos específicos de una feature deben permanecer cerca de la feature cuando no exista una necesidad real de compartirlos.

---

# 7. Flujo del Frontend

El flujo general de una operación que obtiene datos del backend es:

```text
UI Component
     ↓
Feature
     ↓
API
     ↓
Backend
```

La respuesta vuelve hacia la interfaz:

```text
Backend
     ↓
API
     ↓
Feature / State
     ↓
UI Component
```

Los componentes deben concentrarse en la presentación y la interacción del usuario.

La lógica de comunicación con el backend debe mantenerse en la capa correspondiente.

---

# 8. Comunicación Frontend ↔ Backend

El frontend y backend se comunican mediante HTTP utilizando la API definida por el backend.

El frontend no debe acceder directamente a PostgreSQL ni a ninguna infraestructura interna del backend.

```text
Frontend
   │
   │ HTTP
   ↓
Backend API
   │
   ↓
Domain / Application
   │
   ↓
Persistence
```

Los contratos de los endpoints deben mantenerse documentados en:

```text
docs/api.md
```

Cuando un cambio modifica un contrato existente, deben revisarse:

* backend
* frontend
* documentación de API
* tests correspondientes

---

# 9. Dependencias entre capas

La dirección de las dependencias debe mantenerse controlada.

Regla general:

```text
Infrastructure
      ↓
Application / Use Cases
      ↓
Domain
```

El dominio no debe depender de infraestructura.

En particular:

```text
domain/
   ❌ Express
   ❌ TypeORM
   ❌ HTTP
   ❌ detalles de PostgreSQL

server-app/
   ✅ puede utilizar domain/
```

La implementación concreta de infraestructura debe poder cambiar sin obligar a modificar las reglas fundamentales del dominio.

---

# 10. Reutilización

Antes de crear:

* componente
* hook
* utilidad
* servicio
* repository
* caso de uso
* tipo
* middleware

el agente debe buscar primero si ya existe una implementación reutilizable.

No duplicar código cuando una abstracción existente resuelve correctamente el problema.

Sin embargo, tampoco crear abstracciones prematuras únicamente para evitar unas pocas líneas de código.

La reutilización debe mejorar la claridad y mantener las responsabilidades bien definidas.

---

# 11. Incorporación de nuevas funcionalidades

Una nueva funcionalidad debe seguir el flujo definido por el proceso SDD.

```text
Requirement
    ↓
Spec
    ↓
Plan
    ↓
Tasks
    ↓
Implementation
    ↓
Tests
    ↓
Validation
```

Antes de implementar una funcionalidad, el agente debe:

1. Identificar la spec activa.
2. Revisar las tareas correspondientes.
3. Revisar la arquitectura afectada.
4. Localizar implementaciones existentes relacionadas.
5. Realizar el cambio mínimo necesario.
6. Ejecutar las validaciones correspondientes.
7. Actualizar la documentación afectada.

No introducir una arquitectura nueva para resolver una funcionalidad que pueda implementarse correctamente utilizando la arquitectura existente.

---

# 12. Cambios arquitectónicos

Un cambio arquitectónico es cualquier modificación que altere significativamente:

* organización de capas
* responsabilidades de módulos
* flujo de dependencias
* tecnología principal
* persistencia
* comunicación entre frontend y backend
* patrones estructurales del sistema

Estos cambios no deben realizarse como parte de una implementación rutinaria.

Deben estar justificados y documentados antes de implementarse.

Si una tarea requiere un cambio arquitectónico no contemplado por la spec activa, el agente debe detenerse y reportarlo.

---

# 13. Regla final

La arquitectura existente debe ser comprendida antes de modificarla.

Ante la duda:

1. Buscar una implementación existente.
2. Consultar la documentación correspondiente.
3. Revisar la spec y el plan.
4. Mantener la solución dentro de las capas existentes.
5. Preguntar antes de introducir una decisión arquitectónica nueva.

**Entender la arquitectura primero. Modificarla solo cuando sea necesario.**
