# Project Memory

> Contexto operativo y temporal del proyecto.
>
> Este archivo sirve para que los agentes de IA puedan recuperar rápidamente el estado actual del proyecto y continuar el trabajo sin perder contexto.
>
> **No es una fuente de verdad arquitectónica ni de negocio.**
>
> En caso de conflicto, tienen prioridad:
>
> 1. `docs/constitution.md`
> 2. `docs/architecture.md`
> 3. `docs/domain.md`
> 4. `docs/database.md`
> 5. `docs/api.md`
> 6. `docs/use-cases.md`
> 7. `docs/requirements.md`
> 8. `specs/`
> 9. `MEMORY.md`

---

# 1. Estado actual

## Proyecto

Sistema web para gestionar la asistencia de participantes en diferentes sedes.

El objetivo principal es reemplazar el registro manual mediante papel por un sistema digital que permita:

* administrar usuarios;
* administrar sedes;
* administrar participantes;
* registrar asistencias;
* consultar historial;
* utilizar códigos QR para facilitar el registro;
* proporcionar herramientas de gestión y coordinación.

---

## Estado general

El proyecto se encuentra en desarrollo.

La arquitectura base ya está establecida y existe una implementación funcional inicial del backend y frontend.

Actualmente el foco está puesto en continuar el desarrollo de las funcionalidades de coordinación y gestión.

---

# 2. Stack actual

## Backend

* Node.js
* TypeScript
* Express
* TypeORM
* PostgreSQL
* JWT
* Vitest

## Frontend

* React
* TypeScript
* Vite
* React Router
* React Query

## Infraestructura

* Docker
* Docker Compose

---

# 3. Arquitectura actual

El proyecto utiliza un monorepo:

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

El backend está dividido conceptualmente en:

```text
backend/
├── src/
│   ├── domain/
│   └── server-app/
```

### `domain/`

Contiene conceptos y reglas relacionadas con el dominio y la lógica de aplicación.

### `server-app/`

Contiene infraestructura y comunicación con el exterior.

Incluye conceptos como:

* controllers;
* routes;
* middleware;
* database;
* services;
* configuración;
* integración con Express y TypeORM.

---

# 4. Flujo backend

El flujo principal de una petición es:

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

Las responsabilidades detalladas se encuentran en:

```text
docs/architecture.md
```

---

# 5. Frontend

La estructura actual del frontend utiliza:

```text
frontend/src/
├── api/
├── app/
├── context/
├── features/
├── layout/
├── lib/
├── shared/
└── types/
```

El frontend se comunica con el backend mediante la capa de API.

El frontend no debe acceder directamente a la base de datos.

---

# 6. Entidades principales

Las entidades principales actualmente contempladas son:

```text
User
Participant
Location
Attendance
```

También existe el concepto de:

```text
Role
```

Las definiciones formales se encuentran en:

```text
docs/domain.md
docs/database.md
```

No modificar estas relaciones basándose únicamente en este archivo.

---

# 7. User

El modelo actual de usuario contempla conceptualmente:

```text
id
firstName
lastName
documentNumber?
birthDate?
password
email
phone?
isActive
role
```

El usuario puede autenticarse y sus permisos dependen de su rol.

La contraseña debe manejarse de forma segura y nunca debe exponerse en respuestas.

---

# 8. Location

Una sede contempla actualmente:

```text
id
name
address
isActive
```

Las sedes pueden ser activadas o desactivadas.

La desactivación no implica necesariamente eliminar los registros históricos relacionados.

---

# 9. Participant

Los participantes representan a las personas cuya asistencia registra el sistema.

Un `Participant` no debe confundirse automáticamente con un `User`.

```text
User
→ persona que utiliza el sistema.

Participant
→ persona cuya asistencia registra el sistema.
```

La estructura definitiva de `Participant` debe consultarse en la documentación y specs correspondientes.

---

# 10. Attendance

Una asistencia representa conceptualmente:

```text
Participant
    +
Location
    +
Date / Time
```

El criterio definitivo para determinar una asistencia duplicada todavía debe considerarse una decisión pendiente hasta que exista una spec que lo establezca.

No asumir reglas de duplicación basándose únicamente en este archivo.

---

# 11. Autenticación y autorización

El sistema cuenta con autenticación mediante tokens/JWT y middleware de autenticación/autorización.

Conceptualmente:

```text
Request
    ↓
authenticate
    ↓
authorize
    ↓
Controller
    ↓
Use Case
```

La autorización debe realizarse en backend.

El frontend nunca debe considerarse el único mecanismo de seguridad.

---

# 12. Funcionalidades existentes

Actualmente existen funcionalidades relacionadas con:

* autenticación;
* usuarios;
* roles;
* sedes;
* participantes;
* asistencias;
* coordinadores;
* dashboard;
* código QR.

No asumir que todas estas funcionalidades están completamente terminadas.

Antes de modificar una funcionalidad, comprobar su implementación actual.

---

# 13. Endpoint conocido

Actualmente existe un endpoint para crear coordinadores:

```text
POST /users/create/coordinator
```

La implementación y permisos actuales deben verificarse antes de modificarlo.

---

# 14. Consultas de usuarios

Existe una operación para obtener usuarios por rol.

Actualmente se maneja paginación con:

```text
page
limit
role
```

Los valores por defecto conocidos son:

```text
page = 1
limit = 6
```

No cambiar estos valores sin revisar la implementación y la especificación correspondiente.

---

# 15. Estado del desarrollo

## Fase 1

Considerada completada:

* monorepo;
* Docker;
* TypeScript;
* PostgreSQL;
* ORM;
* migraciones;
* entidades iniciales;
* autenticación;
* JWT;
* middleware;
* CRUD básico de usuarios.

---

## Fase 2 — Coordinación

Estado actual:

* listado frontend de coordinadores implementado;
* `GetUsersByRoleUseCase` implementado;
* estructura inicial de gestión de coordinadores existente.

Pendiente o en desarrollo:

* CRUD completo de coordinadores;
* bloqueo/desactivación;
* funcionalidades adicionales de coordinación.

---

## Fase 3 — Dashboard

Planificada:

* asistencias del día;
* filtros por sede;
* filtros por fecha;
* historial de participantes;
* gestión de participantes;
* métricas relevantes.

Las funcionalidades concretas deben convertirse en specs antes de implementarse.

---

# 16. Documentación disponible

La documentación formal actual está organizada de la siguiente manera:

```text
docs/
├── constitution.md
├── architecture.md
├── domain.md
├── database.md
├── api.md
├── use-cases.md
└── requirements.md
```

Cada documento tiene una responsabilidad específica.

Antes de realizar cambios importantes, el agente debe consultar la documentación correspondiente.

---

# 17. SDD

El proyecto utiliza un enfoque de Spec-Driven Development.

El flujo esperado es:

```text
Requirement
    ↓
Specification
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

Las features deben encontrarse dentro de:

```text
specs/
```

Una feature debería seguir una estructura similar a:

```text
specs/
└── 001-feature-name/
    ├── spec.md
    ├── plan.md
    └── tasks.md
```

La estructura exacta debe respetar las reglas definidas en `AGENTS.md`.

---

# 18. Decisiones importantes

## Arquitectura

La arquitectura utiliza separación entre:

```text
Domain
Application / Use Cases
Infrastructure
```

No introducir cambios arquitectónicos importantes sin una especificación o decisión explícita.

---

## Base de datos

La base de datos utiliza:

```text
PostgreSQL
```

y el acceso mediante:

```text
TypeORM
```

Los cambios de esquema deben realizarse mediante migraciones.

---

## API

El frontend no debe acceder directamente a la base de datos.

La comunicación se realiza mediante la API del backend.

---

## Seguridad

La autenticación y autorización se aplican en backend.

No confiar únicamente en restricciones del frontend.

---

# 19. Decisiones pendientes

Las siguientes decisiones todavía pueden requerir definición mediante specs:

### Usuarios

* relación exacta entre usuario y sede;
* acceso de usuarios a múltiples sedes;
* permisos definitivos por rol;
* campos obligatorios definitivos.

### Participantes

* estructura definitiva;
* relación con sedes;
* identificación;
* campos obligatorios;
* estados.

### Asistencias

* criterio exacto de duplicación;
* posibilidad de editar;
* posibilidad de eliminar;
* reglas de registro;
* período válido para registrar asistencia;
* comportamiento ante registros repetidos.

### QR

* contenido;
* identificación;
* expiración;
* reutilización;
* seguridad;
* autenticación;
* generación;
* invalidación.

### Dashboard

* métricas;
* filtros;
* permisos;
* rangos de fechas;
* agregaciones.

Estas decisiones no deben ser inventadas por el agente.

---

# 20. Problemas conocidos

Este apartado debe contener únicamente problemas reales y actualmente relevantes.

Cuando un problema sea solucionado, debe eliminarse o marcarse como resuelto.

Actualmente:

```text
No registrar problemas temporales aquí si ya fueron solucionados.
```

---

# 21. Trabajo actual

Este apartado debe mantenerse actualizado durante el desarrollo.

## Actualmente

La edición parcial de participantes está implementada en backend mediante
`UpdateParticipantUseCase` y el endpoint
`PUT /api/participant/edit/:participantId`. Incluye autenticación,
autorización para `Admin`, `Coordinator` y `Equipment`, validaciones, tests e
índices únicos por sede para documento y email mediante migración formal.

## Próximos pasos

1. Aplicar la migración de índices en cada entorno después de revisar y
   resolver posibles duplicados existentes.
2. Integrar el endpoint de edición desde la capa `api/` del frontend cuando se
   planifique la interfaz correspondiente.
3. Resolver la deuda de `synchronize: true` antes de producción.

Este apartado debe actualizarse cuando el foco del proyecto cambie.

---

# 22. Notas para agentes

Antes de modificar código:

1. Leer `AGENTS.md`.
2. Consultar la documentación relevante.
3. Revisar `MEMORY.md` para conocer el contexto actual.
4. Buscar la spec correspondiente.
5. Revisar la implementación existente.
6. Identificar dependencias.
7. Implementar únicamente lo definido.
8. Ejecutar los tests correspondientes.
9. Actualizar este archivo únicamente si el cambio modifica el contexto relevante del proyecto.

---

# 23. Qué NO debe hacerse con MEMORY.md

`MEMORY.md` no debe utilizarse para:

* reemplazar una spec;
* definir nuevas reglas de negocio;
* definir contratos de API;
* documentar toda la arquitectura;
* almacenar código;
* almacenar información duplicada innecesariamente;
* sobrescribir decisiones tomadas en documentación formal.

No utilizar este archivo como fuente de verdad para decisiones críticas.

---

# 24. Cuándo actualizar MEMORY.md

El agente puede actualizar `MEMORY.md` cuando ocurra algo relevante para el contexto futuro del proyecto.

Por ejemplo:

* se completa una fase;
* se cambia una decisión arquitectónica;
* se implementa una funcionalidad importante;
* aparece un problema relevante;
* se resuelve un problema importante;
* cambia el foco actual del proyecto;
* se toma una decisión que afecta el trabajo futuro;
* cambia significativamente la estructura del proyecto.

No es necesario actualizarlo después de cada pequeño cambio.

---

# 25. Regla de mantenimiento

`MEMORY.md` debe mantenerse:

* actualizado;
* breve en comparación con la documentación formal;
* práctico;
* libre de información obsoleta;
* sin duplicación innecesaria;
* orientado al contexto actual.

Si una información deja de ser relevante, debe eliminarse.

Si una decisión se vuelve permanente y afecta las reglas del sistema, debe trasladarse a la documentación formal correspondiente.

---

# 26. Regla principal

> `MEMORY.md` recuerda el estado y contexto del proyecto. La documentación formal define cómo debe funcionar el proyecto.

Por lo tanto:

```text
MEMORY.md
    ↓
Contexto actual

docs/
    ↓
Conocimiento formal

specs/
    ↓
Comportamiento concreto de una feature

AGENTS.md
    ↓
Reglas para los agentes
```

**El contexto puede cambiar. Las reglas formales deben cambiar mediante una decisión explícita.**
