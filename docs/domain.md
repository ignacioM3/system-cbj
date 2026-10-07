# Dominio del Sistema

Este documento describe los conceptos principales del dominio, sus responsabilidades y las reglas de negocio conocidas del sistema de gestión de asistencia.

El dominio representa el problema que resuelve la aplicación independientemente de cómo se implemente técnicamente.

Las reglas descritas aquí deben respetarse en las specs, casos de uso e implementaciones.

Si una funcionalidad requiere una regla que no está definida en este documento y la decisión afecta al comportamiento del negocio, debe aclararse antes de implementar.

---

# 1. Propósito del dominio

El sistema permite gestionar la asistencia de participantes y talleristas que concurren a diferentes sedes.

El objetivo principal es reemplazar el registro manual en papel por un sistema digital que permita:

* gestionar usuarios y sus roles;
* gestionar participantes;
* gestionar sedes;
* registrar asistencias;
* consultar información relacionada con las asistencias;
* controlar el acceso según los permisos del usuario.

El sistema debe mantener la integridad de la información y permitir conocer quién asistió, cuándo y en qué sede.

---

# 2. Conceptos principales

Los conceptos principales del dominio son:

```text
User
Participant
Location
Attendance
Role
```

Cada concepto representa una responsabilidad diferente dentro del sistema.

---

# 3. User

Un `User` representa una persona que utiliza el sistema administrativo.

Actualmente un usuario contiene información como:

```text
id
firstName
lastName
documentNumber
birthDate
password
email
phone
isActive
role
```

Algunos campos pueden ser opcionales según las reglas de creación definidas por el sistema.

## Responsabilidades

Un usuario:

* se identifica dentro del sistema;
* posee un rol;
* puede autenticarse;
* puede realizar determinadas operaciones según su rol;
* puede tener una sede asociada.

## Estado

Un usuario puede estar activo o inactivo.

```text
isActive = true
    Usuario habilitado

isActive = false
    Usuario bloqueado/deshabilitado
```

Desactivar un usuario no debe implicar eliminarlo físicamente si el sistema necesita conservar su historial.

---

# 4. Roles

El sistema utiliza roles para determinar qué operaciones puede realizar un usuario.

La autorización debe basarse en el rol del usuario autenticado y en las reglas de acceso definidas para cada operación.

Los roles actualmente contemplados por el dominio deben mantenerse alineados con `UserRole` en el código.

Los roles concretos y sus permisos deben documentarse y mantenerse sincronizados con la implementación.

## Regla

Un usuario no debe poder realizar una operación únicamente porque el frontend la oculte.

La autorización real debe aplicarse en el backend.

---

# 5. Location

Una `Location` representa una sede física donde se desarrollan las actividades.

Actualmente contiene información como:

```text
id
name
address
isActive
```

## Responsabilidades

Una sede permite:

* identificar físicamente dónde se desarrolla una actividad;
* asociar personas con una sede;
* registrar asistencias correspondientes a una sede;
* consultar información relacionada con la actividad de esa sede.

## Estado

Una sede puede estar activa o inactiva.

```text
isActive = true
    Sede operativa

isActive = false
    Sede no operativa
```

La desactivación de una sede no debe eliminar el historial asociado a ella.

---

# 6. Relación entre User y Location

Los usuarios administrativos deben tener una sede asociada cuando las reglas del sistema así lo requieran.

La asociación de un usuario con una sede determina el contexto de sede en el que puede operar cuando corresponda.

La existencia y alcance de esta restricción depende del rol del usuario.

No asumir que todos los roles tienen exactamente los mismos permisos sobre todas las sedes.

Si una nueva funcionalidad requiere determinar si un usuario puede acceder a información de una sede diferente a la suya, la regla debe estar definida explícitamente antes de implementar.

---

# 7. Participant

Un `Participant` representa a una persona que participa de las actividades y cuya asistencia debe registrarse.

El participante es diferente de un `User`.

```text
User
    Persona que utiliza el sistema.

Participant
    Persona cuya asistencia se registra.
```

Un participante no necesita ser un usuario autenticado para existir en el sistema.

## Responsabilidades

Un participante:

* pertenece al conjunto de personas registradas en el sistema;
* puede estar asociado a una sede;
* puede tener registros de asistencia;
* puede tener un historial de asistencia.

Los datos específicos y completos de `Participant` deben mantenerse sincronizados con la entidad correspondiente y con `docs/database.md`.

---

# 8. Attendance

Una `Attendance` representa el registro de que un participante realizó una asistencia.

Una asistencia debe permitir determinar como mínimo:

```text
quién asistió
cuándo asistió
en qué sede
```

La asistencia pertenece conceptualmente al participante y a una sede.

## Propósito

El registro de asistencia debe permitir posteriormente:

* conocer las asistencias de un participante;
* consultar asistencia por sede;
* consultar asistencia por fecha;
* construir historiales;
* obtener estadísticas de asistencia.

---

# 9. Identidad de una asistencia

Cada registro de asistencia debe poder identificarse de forma inequívoca.

No se debe crear una segunda asistencia para una misma operación si las reglas del negocio determinan que ya existe un registro válido.

La regla exacta para determinar si dos registros representan la misma asistencia debe definirse explícitamente en la spec correspondiente.

Ejemplo de posibles criterios:

```text
Participant + Location + Date
```

o

```text
Participant + Location + DateTime
```

No asumir uno de estos criterios sin una decisión explícita cuando la funcionalidad dependa de él.

---

# 10. Relación entre Participant, Location y Attendance

La relación conceptual es:

```text
Participant
     │
     │ registra
     ▼
Attendance
     │
     │ ocurre en
     ▼
Location
```

Una persona puede tener múltiples registros de asistencia.

Una sede puede tener múltiples registros de asistencia.

Cada asistencia corresponde a un participante y a una sede.

---

# 11. Ciclo de vida

Las entidades principales pueden tener estados activos/inactivos cuando el dominio lo requiera.

La desactivación de una entidad no debe eliminar automáticamente información histórica que dependa de ella.

Especialmente:

```text
User
Location
Participant
Attendance
```

deben conservar la información histórica necesaria para auditoría y consultas.

La eliminación física de información histórica debe considerarse una decisión de negocio explícita y no una optimización técnica.

---

# 12. Autenticación

La autenticación determina quién es el usuario que está realizando una operación.

La autenticación no equivale a autorización.

```text
Autenticación
    ¿Quién sos?

Autorización
    ¿Qué podés hacer?
```

Una operación protegida debe comprobar ambas cuando corresponda.

Las credenciales nunca deben almacenarse de manera insegura.

El manejo concreto de contraseñas, tokens y sesiones pertenece a la infraestructura de autenticación, pero debe respetar las reglas de seguridad definidas por la Constitución.

---

# 13. Autorización

Las operaciones del sistema están condicionadas por:

* identidad del usuario;
* rol;
* estado del usuario;
* sede asociada cuando corresponda;
* reglas específicas de la operación.

El frontend puede ocultar funcionalidades que el usuario no tiene permitido utilizar, pero esto nunca reemplaza la autorización del backend.

---

# 14. Reglas de negocio

Las reglas de negocio deben existir en un único lugar y no duplicarse entre diferentes capas.

Ejemplos de reglas que pertenecen al dominio:

* un usuario inactivo no debe poder operar si la regla de autenticación lo impide;
* una operación protegida debe respetar el rol correspondiente;
* una asistencia pertenece a un participante y una sede;
* desactivar una sede no debe eliminar su historial;
* desactivar un usuario no debe eliminar automáticamente sus datos históricos;
* una asistencia duplicada debe evitarse cuando las reglas del negocio determinen que representa el mismo registro.

Estas reglas deben implementarse en el lugar apropiado y no depender únicamente de validaciones del frontend.

---

# 15. Historial y trazabilidad

Las asistencias representan información histórica.

El sistema debe preservar la capacidad de determinar:

```text
Participante
     ↓
Asistencia
     ↓
Fecha / hora
     ↓
Sede
```

Las operaciones administrativas no deben destruir innecesariamente información histórica.

Cuando una funcionalidad implique modificar o eliminar información histórica, la decisión debe estar explícitamente definida en la spec.

---

# 16. Reglas pendientes de definición

Las siguientes decisiones no deben ser asumidas por el agente hasta que estén definidas:

* permisos exactos de cada `UserRole`;
* alcance de acceso de cada rol sobre las distintas sedes;
* estructura completa de `Participant`;
* campos obligatorios y opcionales de cada entidad;
* criterio exacto para considerar una asistencia duplicada;
* si un participante puede pertenecer a más de una sede;
* si un usuario puede pertenecer a más de una sede;
* reglas exactas para modificar o eliminar asistencias;
* comportamiento cuando una sede o participante está inactivo;
* reglas específicas de registro de asistencia mediante QR.

Estas decisiones deben definirse en las specs o en la documentación correspondiente antes de que una implementación dependa de ellas.

---

# 17. Relación con otros documentos

Este documento describe el modelo conceptual del negocio.

Los detalles técnicos se encuentran en:

```text
docs/architecture.md
    Arquitectura y responsabilidades de las capas.

docs/database.md
    Entidades persistidas, relaciones, columnas y migraciones.

docs/api.md
    Contratos HTTP y endpoints.

docs/use-cases.md
    Operaciones que el sistema permite realizar.

docs/requirements.md
    Requisitos funcionales y no funcionales.
```

Si existe una contradicción entre este documento y una decisión todavía no aprobada, el agente debe detenerse y solicitar aclaración.

---

# 18. Regla principal

El código debe representar el dominio, no al revés.

Las decisiones técnicas no deben modificar silenciosamente las reglas del negocio.

Cuando una implementación requiera una nueva regla de negocio:

1. identificar la decisión;
2. documentarla;
3. incorporarla a la spec correspondiente;
4. actualizar esta documentación cuando corresponda;
5. implementar únicamente después de que la decisión esté aprobada.

**El dominio define qué significa el sistema. La arquitectura define cómo se implementa.**
