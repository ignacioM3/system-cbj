# Requirements

## Propósito

Este documento define los requisitos funcionales y no funcionales generales del sistema de gestión de asistencias.

Los requisitos describen **qué debe hacer el sistema** y **qué condiciones debe cumplir**, sin definir detalles innecesarios de implementación.

La implementación concreta de cada funcionalidad debe definirse posteriormente mediante especificaciones dentro de:

```text
specs/
```

Este documento debe mantenerse alineado con:

* `docs/constitution.md`
* `docs/architecture.md`
* `docs/domain.md`
* `docs/database.md`
* `docs/api.md`
* `docs/use-cases.md`

---

# 1. Alcance del sistema

El sistema tiene como objetivo reemplazar el registro manual de asistencia mediante papel por una aplicación web.

El sistema debe permitir administrar:

* usuarios;
* roles;
* sedes;
* participantes;
* asistencias;
* historial de asistencias;
* información necesaria para la gestión de las actividades.

También debe proporcionar mecanismos para:

* autenticación;
* autorización;
* consulta de información;
* registro de asistencia;
* administración de participantes;
* administración de sedes;
* visualización de información relevante para la coordinación.

---

# 2. Actores del sistema

Los actores representan los diferentes tipos de personas que interactúan con el sistema.

Los roles definitivos y sus permisos deben mantenerse alineados con el dominio y las especificaciones.

Actualmente existe el concepto de:

```text
User
Role
Participant
Location
```

Los roles concretos deben determinar qué operaciones puede realizar cada usuario.

No deben inventarse permisos adicionales sin una especificación.

---

# 3. Requisitos funcionales

## RF-001 — Autenticación

El sistema debe permitir que un usuario registrado pueda autenticarse utilizando sus credenciales.

El sistema debe:

* validar las credenciales;
* rechazar credenciales incorrectas;
* impedir el acceso de usuarios que no cumplan las condiciones necesarias;
* generar el mecanismo de autenticación correspondiente;
* permitir utilizar la identidad autenticada para las operaciones posteriores.

### Criterios generales

* Las contraseñas no deben almacenarse en texto plano.
* Las credenciales no deben exponerse en respuestas.
* Los endpoints protegidos deben requerir autenticación.

---

# 4. Autorización

## RF-002 — Control de acceso por rol

El sistema debe controlar las operaciones disponibles según el rol del usuario autenticado.

El backend debe ser responsable de aplicar las reglas de autorización.

El frontend puede ocultar o mostrar funcionalidades según el rol, pero esto no debe considerarse una medida de seguridad suficiente.

### Criterios generales

Un usuario:

* debe poder acceder únicamente a las operaciones permitidas;
* no debe poder ejecutar una operación protegida modificando manualmente una petición;
* debe recibir una respuesta adecuada cuando no tenga permisos.

Los permisos específicos de cada rol deben definirse en las specs correspondientes.

---

# 5. Gestión de usuarios

## RF-003 — Crear usuario

El sistema debe permitir crear usuarios.

La creación debe contemplar:

* nombre;
* apellido;
* email;
* contraseña;
* rol;
* teléfono cuando corresponda;
* documento cuando corresponda;
* fecha de nacimiento cuando corresponda;
* estado inicial.

Los campos obligatorios definitivos deben establecerse en la especificación correspondiente.

---

## RF-004 — Email único

El sistema no debe permitir crear dos usuarios con el mismo email cuando la regla de unicidad esté definida para usuarios.

Cuando se produzca un conflicto, el sistema debe devolver un error controlado.

---

## RF-005 — Consultar usuario

El sistema debe permitir consultar información de usuarios.

La información sensible no debe formar parte de respuestas destinadas al cliente.

---

## RF-006 — Listar usuarios

El sistema debe permitir consultar múltiples usuarios.

La consulta puede soportar:

* filtros;
* rol;
* paginación;
* búsqueda.

Las capacidades definitivas deben definirse por especificación.

Actualmente existe el concepto de consulta por rol y paginación.

---

## RF-007 — Actualizar usuario

El sistema debe permitir modificar información autorizada de un usuario.

No todos los campos deben ser necesariamente modificables.

Los campos permitidos deben definirse por especificación.

---

## RF-008 — Activar usuario

El sistema debe permitir activar un usuario previamente desactivado.

---

## RF-009 — Desactivar usuario

El sistema debe permitir desactivar un usuario.

La desactivación debe preservar la información histórica asociada al usuario salvo que una especificación determine lo contrario.

---

# 6. Gestión de coordinadores

## RF-010 — Crear coordinador

El sistema debe permitir crear usuarios con rol de coordinador mediante el flujo correspondiente.

Actualmente existe:

```text
POST /users/create/coordinator
```

La operación debe respetar:

* autenticación;
* autorización;
* validación;
* unicidad;
* seguridad de contraseña;
* reglas del rol.

---

# 7. Gestión de sedes

## RF-011 — Crear sede

El sistema debe permitir crear una sede.

Una sede debe contemplar como mínimo conceptualmente:

```text
id
name
address
isActive
```

La estructura definitiva debe mantenerse alineada con el modelo de dominio y base de datos.

---

## RF-012 — Consultar sede

El sistema debe permitir consultar una sede específica.

---

## RF-013 — Listar sedes

El sistema debe permitir consultar las sedes disponibles.

La consulta puede incorporar:

* búsqueda;
* filtros;
* estado;
* paginación.

Estas capacidades deben definirse mediante especificaciones concretas.

---

## RF-014 — Actualizar sede

El sistema debe permitir actualizar información permitida de una sede.

---

## RF-015 — Activar sede

El sistema debe permitir activar una sede previamente desactivada.

---

## RF-016 — Desactivar sede

El sistema debe permitir desactivar una sede sin eliminar automáticamente la información histórica relacionada.

---

# 8. Gestión de participantes

## RF-017 — Crear participante

El sistema debe permitir registrar participantes.

La información requerida debe definirse mediante la especificación correspondiente.

El sistema debe validar los datos antes de crear el participante.

---

## RF-018 — Consultar participante

El sistema debe permitir consultar información de un participante.

---

## RF-019 — Listar participantes

El sistema debe permitir consultar participantes.

Dependiendo de la especificación, la consulta puede permitir:

* búsqueda;
* filtros;
* sede;
* estado;
* paginación.

---

## RF-020 — Actualizar participante

El sistema debe permitir modificar información autorizada de un participante.

---

## RF-021 — Activar participante

El sistema debe permitir activar un participante.

---

## RF-022 — Desactivar participante

El sistema debe permitir desactivar un participante sin eliminar necesariamente su historial.

---

# 9. Gestión de asistencias

## RF-023 — Registrar asistencia

El sistema debe permitir registrar la asistencia de un participante.

Una asistencia debe estar relacionada conceptualmente con:

```text
Participant
Location
Date / Time
```

El registro debe validar las condiciones necesarias antes de persistir la asistencia.

---

## RF-024 — Evitar asistencias duplicadas

El sistema debe evitar registrar una asistencia duplicada cuando las reglas del sistema determinen que la nueva asistencia representa el mismo evento.

La definición exacta de qué constituye una asistencia duplicada debe establecerse en una especificación.

No debe asumirse automáticamente una combinación concreta de campos.

---

## RF-025 — Consultar asistencia

El sistema debe permitir consultar una asistencia registrada.

---

## RF-026 — Historial de asistencias

El sistema debe permitir consultar el historial de asistencias.

El historial puede permitir filtrar por:

* participante;
* sede;
* fecha;
* rango de fechas.

Los filtros definitivos deben definirse mediante especificación.

---

## RF-027 — Asistencias del día

El sistema debe permitir consultar las asistencias correspondientes al día actual.

Esta funcionalidad será utilizada por el dashboard y otras vistas de gestión.

La definición exacta de "día actual" debe considerar la zona horaria definida por el sistema.

---

# 10. Registro mediante QR

## RF-028 — Identificación mediante QR

El sistema debe soportar un flujo de registro de asistencia mediante código QR.

El QR debe permitir iniciar el proceso de identificación o registro correspondiente.

El comportamiento exacto debe definirse en una especificación.

---

## RF-029 — Validación del QR

El sistema debe validar la información proporcionada por el QR antes de registrar una asistencia.

La validación debe contemplar las reglas de seguridad definidas para el mecanismo.

---

## RF-030 — Protección del flujo QR

El sistema debe evitar que un QR pueda utilizarse de manera no autorizada.

Antes de implementar este requisito deben definirse:

* contenido del QR;
* identificación;
* expiración;
* reutilización;
* tokens;
* autenticación;
* protección contra falsificación.

---

# 11. Dashboard

## RF-031 — Dashboard de coordinación

El sistema debe proporcionar una vista general para usuarios autorizados.

El dashboard debe permitir consultar información relevante del sistema.

Como mínimo se contempla conceptualmente:

* asistencias del día;
* información por sede;
* filtros;
* información de participantes;
* historial.

Las métricas definitivas deben definirse mediante especificación.

---

## RF-032 — Filtrar información por sede

Los usuarios autorizados deben poder filtrar información relacionada con una sede cuando la operación lo permita.

---

## RF-033 — Filtrar información por fecha

Los usuarios autorizados deben poder consultar información utilizando filtros temporales cuando la funcionalidad lo requiera.

---

# 12. Historial

## RF-034 — Preservación del historial

El sistema debe preservar información histórica necesaria para mantener trazabilidad.

La desactivación de usuarios, participantes o sedes no debe eliminar automáticamente los registros históricos asociados.

---

## RF-035 — Integridad histórica

Los registros de asistencia deben conservar las relaciones necesarias para identificar:

* quién asistió;
* dónde;
* cuándo.

La estructura exacta depende del modelo de dominio y base de datos.

---

# 13. Estados

## RF-036 — Entidades activas e inactivas

Las entidades que tengan un estado activo/inactivo deben poder gestionarse sin depender necesariamente de eliminación física.

El sistema debe distinguir entre:

```text
Activo
Inactivo
```

La disponibilidad de una entidad debe respetar su estado.

---

# 14. Seguridad

## RF-037 — Protección de endpoints

Los endpoints que contengan información protegida o permitan modificar datos deben requerir autenticación cuando corresponda.

---

## RF-038 — Autorización en backend

Las restricciones de acceso deben aplicarse en backend.

El frontend nunca debe ser considerado el único mecanismo de autorización.

---

## RF-039 — Protección de credenciales

El sistema debe proteger:

* contraseñas;
* tokens;
* credenciales;
* información sensible.

Estos datos no deben aparecer innecesariamente en logs, respuestas o mensajes de error.

---

## RF-040 — Errores controlados

Los errores deben ser manejados de forma consistente.

El sistema no debe exponer:

* stack traces;
* credenciales;
* información interna de infraestructura;
* consultas SQL;
* información sensible.

---

# 15. Validación

## RF-041 — Validación de entradas

El sistema debe validar las entradas provenientes del cliente.

Debe comprobar:

* tipos;
* formatos;
* campos requeridos;
* valores permitidos;
* relaciones necesarias.

La validación debe realizarse también en backend.

---

## RF-042 — Integridad de datos

El sistema debe impedir que se almacenen datos que violen las reglas de integridad definidas.

La base de datos debe utilizar mecanismos apropiados como:

* foreign keys;
* unique constraints;
* not null;
* tipos adecuados;
* índices cuando correspondan.

---

# 16. Paginación

## RF-043 — Paginación

Las consultas que puedan devolver grandes cantidades de información deben poder utilizar paginación cuando corresponda.

Actualmente existe el concepto:

```text
page
limit
```

con valores por defecto conocidos en determinadas consultas.

Los valores definitivos deben mantenerse alineados con la implementación y especificaciones.

---

# 17. Requisitos no funcionales

## RNF-001 — Mantenibilidad

El sistema debe mantener una arquitectura clara y modular.

Las funcionalidades deben poder modificarse sin generar dependencias innecesarias entre componentes.

---

## RNF-002 — Testabilidad

Las reglas importantes del sistema deben poder probarse automáticamente.

Los Use Cases deben poder probarse sin depender necesariamente de un servidor HTTP real.

---

## RNF-003 — Seguridad

La seguridad debe considerarse una propiedad transversal.

Debe contemplarse en:

* autenticación;
* autorización;
* API;
* base de datos;
* gestión de credenciales;
* QR;
* validación de entradas.

---

## RNF-004 — Integridad de datos

El sistema debe minimizar la posibilidad de inconsistencias entre entidades relacionadas.

Las operaciones críticas deben utilizar las garantías apropiadas de la base de datos.

---

## RNF-005 — Consistencia

El comportamiento de funcionalidades similares debe seguir patrones consistentes.

Por ejemplo:

* errores;
* respuestas;
* validaciones;
* paginación;
* nombres;
* estados.

---

## RNF-006 — Rendimiento

Las consultas deben diseñarse evitando operaciones innecesariamente costosas.

Cuando sea necesario deben utilizarse:

* índices;
* paginación;
* consultas eficientes;
* filtros en base de datos.

No deben realizarse optimizaciones prematuras sin evidencia.

---

## RNF-007 — Escalabilidad

La arquitectura debe permitir incorporar nuevas sedes, usuarios, participantes y registros de asistencia sin requerir una reestructuración completa del sistema.

---

## RNF-008 — Compatibilidad

Los cambios en API, base de datos o modelos deben considerar el impacto sobre otras partes del sistema.

No deben introducirse cambios incompatibles sin una especificación y decisión explícita.

---

## RNF-009 — Observabilidad

Los errores importantes deben poder identificarse mediante mecanismos adecuados de logging.

Los logs no deben contener información sensible.

La estrategia definitiva de logging puede evolucionar con el proyecto.

---

## RNF-010 — Usabilidad

La interfaz debe permitir completar las tareas principales de forma clara y eficiente.

Las funcionalidades relacionadas con asistencia deben priorizar:

* rapidez;
* claridad;
* pocos pasos;
* feedback inmediato;
* adaptación a diferentes tamaños de pantalla.

---

## RNF-011 — Responsive

Las funcionalidades principales deben poder utilizarse en dispositivos con diferentes tamaños de pantalla.

Especialmente:

* registro de asistencia;
* QR;
* gestión de participantes;
* dashboard.

---

# 18. Requisitos de arquitectura

## RNF-012 — Separación de responsabilidades

El sistema debe respetar la separación establecida en `docs/architecture.md`.

No se debe colocar:

* lógica de negocio en controllers;
* acceso directo a base de datos en controllers;
* lógica de negocio en routes;
* consultas SQL/TypeORM directamente en Use Cases cuando exista una abstracción apropiada.

---

## RNF-013 — Dependencias

Las dependencias deben respetar la dirección arquitectónica establecida.

Conceptualmente:

```text
Infrastructure
      ↓
Application / Use Cases
      ↓
Domain
```

El dominio no debe depender de detalles de infraestructura.

---

# 19. Requisitos de documentación

## RNF-014 — Documentación sincronizada

Cuando una modificación cambie significativamente:

* arquitectura;
* dominio;
* base de datos;
* API;
* requisitos;

la documentación correspondiente debe actualizarse.

---

## RNF-015 — Especificaciones

Las funcionalidades nuevas deben contar con una especificación antes de ser implementadas.

Una feature debe seguir:

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

---

# 20. Requisitos para agentes de IA

Los agentes deben utilizar este documento como referencia para comprender el alcance general del sistema.

Sin embargo, `requirements.md` **no autoriza por sí mismo la implementación de una funcionalidad**.

Antes de implementar una feature, el agente debe localizar su especificación correspondiente dentro de:

```text
specs/
```

Si no existe una especificación suficiente, el agente debe detenerse y solicitar definición.

---

## 20.1. No inventar requisitos

Si una funcionalidad no está definida, el agente no debe asumir:

* campos;
* permisos;
* relaciones;
* endpoints;
* reglas de negocio;
* comportamiento del QR;
* restricciones;
* respuestas;
* flujos alternativos.

Debe identificar la decisión pendiente.

---

## 20.2. No ampliar el alcance

Si una tarea solicita:

```text
Implementar X
```

el agente no debe interpretar automáticamente:

```text
Implementar X
+ refactorizar Y
+ cambiar Z
+ mejorar arquitectura
+ agregar funcionalidad relacionada
```

Debe realizar únicamente lo necesario para cumplir la especificación.

---

## 20.3. Requisitos y especificaciones

Los requisitos generales definen:

```text
Qué necesita el sistema
```

Las specs definen:

```text
Cómo debe comportarse una feature concreta
```

Por ejemplo:

```text
requirements.md
    ↓
RF-023 Registrar asistencia
    ↓
specs/004-registrar-asistencia/spec.md
    ↓
plan.md
    ↓
tasks.md
```

---

# 21. Requisitos pendientes de definición

Existen áreas que todavía requieren decisiones antes de convertirse en especificaciones definitivas.

### Usuarios

* permisos exactos de cada rol;
* relación de usuarios con sedes;
* alcance de acceso entre sedes;
* campos obligatorios definitivos.

### Participantes

* estructura completa;
* identificación;
* relación con sedes;
* estado;
* datos obligatorios.

### Asistencias

* definición exacta de duplicado;
* reglas de modificación;
* reglas de eliminación;
* relación con sede;
* período válido para registrar;
* comportamiento ante registros repetidos.

### QR

* información contenida;
* identificación;
* seguridad;
* expiración;
* reutilización;
* autenticación;
* generación;
* invalidación.

### Dashboard

* métricas;
* filtros;
* permisos;
* rangos de fechas;
* agregaciones.

### API

* estructura definitiva de respuestas;
* estructura definitiva de errores;
* paginación;
* versionado;
* convenciones definitivas.

Estas decisiones deben resolverse antes de implementar funcionalidades que dependan de ellas.

---

# 22. Trazabilidad

Cada requisito implementado debería poder relacionarse con una especificación.

Ejemplo:

```text
RF-023
Registrar asistencia
        ↓
SPEC-004
Registrar asistencia
        ↓
TASK-001
Crear Use Case
        ↓
TASK-002
Crear Repository
        ↓
TASK-003
Crear endpoint
        ↓
TASK-004
Crear tests
```

Esto permite conocer:

* por qué existe una funcionalidad;
* qué comportamiento debe cumplir;
* qué tareas la implementan;
* qué tests la validan.

---

# 23. Criterio de aceptación general

Una funcionalidad se considera correctamente implementada cuando:

1. cumple los requisitos definidos;
2. cumple su especificación;
3. respeta la arquitectura;
4. respeta las reglas del dominio;
5. mantiene la integridad de datos;
6. respeta las reglas de seguridad;
7. tiene las pruebas necesarias;
8. las pruebas relevantes pasan;
9. la documentación correspondiente está actualizada cuando sea necesario.

---

# 24. Regla principal

> Los requisitos definen qué necesita hacer el sistema. Las especificaciones definen el comportamiento concreto. La implementación debe cumplir ambos sin inventar comportamiento adicional.

El agente debe recordar:

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

**No implementar por suposición.**

**Si una decisión no está definida, debe identificarse antes de convertirla en código.**
