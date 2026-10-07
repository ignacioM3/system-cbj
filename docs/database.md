# Base de Datos

Este documento describe las reglas y decisiones relacionadas con la persistencia de datos del sistema.

La aplicación utiliza PostgreSQL como base de datos y TypeORM como ORM.

Este documento debe mantenerse sincronizado con las entidades, relaciones y migraciones existentes.

---

# 1. Tecnología

La persistencia utiliza:

* PostgreSQL como motor de base de datos.
* TypeORM como ORM.
* TypeScript para las entidades y configuración relacionada.
* Migraciones de TypeORM para cambios estructurales.

La base de datos no debe ser accedida directamente desde controllers ni desde componentes del frontend.

---

# 2. Responsabilidad de la persistencia

La capa de persistencia es responsable de:

* almacenar información del sistema;
* recuperar información;
* actualizar registros;
* eliminar registros cuando esté permitido;
* mantener relaciones entre entidades;
* garantizar las restricciones definidas por el modelo;
* ejecutar migraciones.

La persistencia no debe contener reglas de negocio que pertenezcan al dominio.

Las consultas pueden aplicar restricciones necesarias para garantizar la integridad de los datos, pero las decisiones de negocio deben permanecer en las capas correspondientes.

---

# 3. Entidades principales

El sistema trabaja con entidades relacionadas con:

```
User
Location
Participant
Attendance
```

Las entidades concretas deben mantenerse sincronizadas entre:

```
Dominio
   ↓
Entidades TypeORM
   ↓
Base de datos
```

Una modificación en una entidad debe analizarse también desde el punto de vista del dominio y de las relaciones existentes.

---

# 4. User

La entidad `User` representa a un usuario del sistema.

Los campos actualmente contemplados incluyen:

``` 
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
locationId
location
```

Los campos opcionales deben mantenerse alineados con la definición actual de la entidad.

## Identificador

`id` identifica de manera única al usuario.

Debe utilizarse como identificador interno para relaciones con otras entidades.

## Estado

`isActive` representa si el usuario se encuentra habilitado.

```
true
    Usuario activo

false
    Usuario inactivo
```

La desactivación de un usuario no debe implicar automáticamente su eliminación física de la base de datos.

## Email

El email se utiliza como dato de identificación dentro del sistema de autenticación cuando corresponda.

Debe respetarse la restricción de unicidad definida por la aplicación.

No deben generarse dos usuarios con el mismo email cuando la regla de negocio lo prohíba.

## Password

Las contraseñas no deben almacenarse en texto plano.

Deben almacenarse utilizando el mecanismo seguro definido por la aplicación.

---

# 5. Location

La entidad `Location` representa una sede física.

Los campos actualmente contemplados incluyen:

``` 
id
name
address
isActive
users
```

## Identificador

`id` identifica de manera única a la sede.

## Estado

`isActive` determina si la sede está operativa.

Una sede inactiva no debe eliminar automáticamente los registros históricos relacionados con ella.

---

# 6. Participant

`Participant` representa a una persona cuya asistencia es gestionada por el sistema.

La estructura completa de la entidad debe mantenerse sincronizada con la implementación actual.

Los campos y relaciones que todavía no estén definidos explícitamente no deben ser inventados por el agente.

Si una funcionalidad requiere modificar la estructura de `Participant`, la modificación debe formar parte de una spec aprobada.

## Restricciones de unicidad por sede

La identificación de participantes se protege mediante dos índices únicos
compuestos:

* `UQ_participants_document_location` sobre (`documentNumber`, `locationId`);
* `UQ_participants_email_location` sobre (`email`, `locationId`).

PostgreSQL permite múltiples valores `NULL` en el índice de email. Las
validaciones de aplicación complementan estas restricciones y excluyen al
propio participante durante una edición.

La migración formal
`1760000000000-AddParticipantUniqueIndexes` verifica primero si existen
documentos o emails duplicados por sede y aborta sin modificar datos cuando
encuentra alguno. Los duplicados deben resolverse manualmente antes de volver a
ejecutarla; la migración no elimina ni combina participantes.

Actualmente `data-source.ts` todavía utiliza `synchronize: true`. Esto es deuda
técnica: las migraciones deben convertirse en la única fuente de cambios de
esquema y `synchronize` debe desactivarse antes de operar en producción. Mientras
permanezca activo, los índices también se declaran en `ParticipantSchema` para
evitar divergencias entre el schema de TypeORM y la migración.

---

# 7. Attendance

`Attendance` representa un registro de asistencia de un participante.

Conceptualmente debe estar relacionado con:

```text id="j7z4sj"
Participant
     │
     └── Attendance
              │
              └── Location
```

Una asistencia debe permitir determinar como mínimo:

* participante;
* sede;
* fecha y/o hora del registro.

La estructura exacta debe mantenerse sincronizada con la entidad implementada.

---

# 8. Relaciones

Las relaciones entre entidades deben reflejar las reglas del dominio.

Relaciones conceptuales actuales:

```text id="8ljxw0"
User
 │
 └── Location

Participant
 │
 └── Location

Attendance
 ├── Participant
 └── Location
```

La cardinalidad exacta de cada relación debe coincidir con la implementación existente y con las reglas definidas por el dominio.

No modificar una relación únicamente porque otra estructura parezca más conveniente.

Una modificación de cardinalidad requiere analizar:

* dominio;
* código;
* migraciones existentes;
* API;
* datos existentes;
* funcionalidades afectadas.

---

# 9. Claves y restricciones

Las entidades deben utilizar identificadores únicos.

Las restricciones importantes deben mantenerse en la base de datos cuando corresponda.

Ejemplos:

* primary keys;
* foreign keys;
* unique constraints;
* not null constraints;
* índices necesarios para consultas frecuentes.

Las restricciones de base de datos complementan las validaciones de aplicación.

No se debe depender exclusivamente del frontend para garantizar la integridad de los datos.

---

# 10. Integridad referencial

Las relaciones entre entidades deben mantener integridad referencial.

No debe ser posible crear relaciones hacia entidades inexistentes cuando la relación requiera una entidad válida.

Antes de modificar una foreign key se debe analizar:

* registros existentes;
* comportamiento de eliminación;
* comportamiento de actualización;
* migraciones;
* impacto sobre casos de uso.

Las acciones `CASCADE`, `SET NULL`, `RESTRICT` u otras estrategias deben utilizarse únicamente cuando correspondan al comportamiento definido del dominio.

No agregar cascadas automáticamente como solución rápida.

---

# 11. Datos históricos

El sistema gestiona información histórica de asistencia.

Los registros históricos no deben eliminarse automáticamente debido a:

* desactivación de usuarios;
* desactivación de sedes;
* desactivación de participantes.

Cuando sea necesario conservar información histórica, se debe preferir la desactivación lógica antes que la eliminación física.

Cualquier eliminación física debe estar justificada por una regla de negocio explícita.

---

# 12. Migraciones

Todo cambio estructural de la base de datos debe realizarse mediante una migración.

Ejemplos de cambios que requieren migración:

* crear una tabla;
* eliminar una tabla;
* agregar una columna;
* eliminar una columna;
* modificar un tipo;
* crear una foreign key;
* eliminar una foreign key;
* agregar un índice;
* modificar una restricción;
* modificar una relación.

No modificar directamente la estructura de producción como sustituto de una migración.

Las migraciones deben:

1. representar un cambio concreto;
2. poder ejecutarse de manera reproducible;
3. mantener la integridad de los datos;
4. contemplar los datos existentes cuando corresponda.

---

# 13. Migraciones y código

Cuando una modificación de código requiere un cambio de esquema, ambos cambios deben considerarse parte de la misma funcionalidad.

Ejemplo:

```text id="z9f4tq"
Nueva relación
    ↓
Entidad TypeORM
    ↓
Migración
    ↓
Caso de uso
    ↓
API
    ↓
Tests
```

No modificar únicamente la entidad TypeORM y asumir que la base de datos se actualizará automáticamente en entornos donde las migraciones son la fuente de verdad.

---

# 14. Datos existentes

Antes de modificar una estructura existente, considerar:

* registros existentes;
* valores `NULL`;
* restricciones actuales;
* relaciones existentes;
* compatibilidad con versiones anteriores;
* impacto sobre la aplicación.

Un cambio aparentemente simple puede requerir una migración de datos.

Ejemplo:

```text id="9p6s9x"
Agregar columna NOT NULL
```

No debe hacerse directamente si existen registros anteriores que no poseen un valor válido para esa columna.

Debe definirse una estrategia de migración de datos.

---

# 15. Índices

Los índices deben agregarse cuando exista una necesidad concreta de consulta o integridad.

No crear índices indiscriminadamente.

Antes de agregar un índice considerar:

* frecuencia de lectura;
* frecuencia de escritura;
* columnas utilizadas en filtros;
* columnas utilizadas en relaciones;
* tamaño esperado de la tabla.

Las decisiones importantes relacionadas con índices deben documentarse cuando afecten significativamente al diseño de persistencia.

---

# 16. Acceso a datos

El acceso a la base de datos debe realizarse mediante las abstracciones de persistencia existentes.

El flujo esperado es:

```text id="q5s3m7"
Use Case
   ↓
Service / Repository
   ↓
TypeORM
   ↓
PostgreSQL
```

Los controllers no deben ejecutar consultas directamente.

Los componentes del frontend nunca deben acceder directamente a PostgreSQL.

---

# 17. Transacciones

Las operaciones que modifican múltiples registros y requieren consistencia deben considerar el uso de transacciones.

Una transacción debe utilizarse cuando una operación de negocio no pueda quedar parcialmente aplicada sin generar un estado inválido.

Ejemplo conceptual:

```text id="1p5yhz"
Operación
   ↓
Modificar A
   ↓
Modificar B
   ↓
Modificar C
```

Si A, B y C forman una única operación de negocio, un fallo intermedio no debería dejar datos inconsistentes.

La necesidad concreta de una transacción debe determinarse según la operación.

---

# 18. Cambios destructivos

No realizar cambios destructivos sin una razón explícita.

Se consideran destructivos, entre otros:

* eliminar tablas;
* eliminar columnas;
* eliminar datos;
* modificar tipos de manera incompatible;
* eliminar restricciones necesarias;
* cambiar relaciones de manera que se pierdan datos.

Antes de realizar un cambio destructivo se debe:

1. identificar el motivo;
2. analizar el impacto;
3. comprobar los datos existentes;
4. definir una estrategia de migración;
5. documentar la decisión;
6. obtener aprobación cuando corresponda.

---

# 19. Consistencia con el dominio

La base de datos debe representar correctamente el dominio.

No modificar el modelo de datos únicamente para simplificar una consulta si eso introduce una contradicción con las reglas del negocio.

Cuando exista un conflicto entre:

```text id="6u0z1e"
Modelo de datos
       vs
Regla de negocio
```

la decisión debe analizarse antes de modificar la implementación.

La solución no debe ocultar el problema mediante lógica duplicada.

---

# 20. Fuente de verdad

Para cambios estructurales:

```text id="q0eq3p"
Migraciones
      ↓
Esquema de base de datos
```

Para reglas del negocio:

```text id="pr3d5f"
Dominio / Specs
      ↓
Implementación
```

Para contratos HTTP:

```text id="6w2h7s"
API documentation / Specs
      ↓
Backend + Frontend
```

La entidad TypeORM no debe considerarse por sí sola la única fuente de verdad del sistema.

Los cambios deben mantenerse sincronizados entre documentación, código y base de datos.

---

# 21. Reglas para agentes

Antes de modificar la base de datos, el agente debe:

1. Revisar la spec activa.
2. Revisar `docs/domain.md`.
3. Revisar las entidades relacionadas.
4. Revisar las migraciones existentes.
5. Identificar relaciones afectadas.
6. Evaluar datos existentes.
7. Determinar si el cambio requiere migración.
8. Implementar el cambio mínimo necesario.
9. Ejecutar las migraciones y tests correspondientes cuando sea posible.
10. Actualizar esta documentación si la estructura o las reglas de persistencia cambian.

El agente no debe:

* modificar tablas manualmente para evitar crear una migración;
* eliminar datos para hacer pasar un test;
* eliminar restricciones sin justificación;
* introducir relaciones nuevas sin una decisión documentada;
* asumir cardinalidades no definidas;
* modificar el esquema fuera del alcance de la spec.

---

# 22. Decisiones pendientes

Las siguientes decisiones deben mantenerse explícitas hasta que estén definidas:

* cardinalidad exacta entre `User` y `Location`;
* cardinalidad exacta entre `Participant` y `Location`;
* estructura completa de `Participant`;
* estructura completa de `Attendance`;
* restricciones de unicidad de asistencia;
* estrategia de eliminación para cada relación;
* índices específicos necesarios;
* comportamiento de registros históricos ante modificaciones;
* estrategia definitiva para registrar asistencias mediante QR.

Estas decisiones no deben ser inventadas por el agente.

Cuando una tarea dependa de una de ellas, debe detenerse y solicitar una decisión.

---

# 23. Documentación relacionada

Este documento debe consultarse junto con:

```text id="n6y1ip"
docs/constitution.md
    Principios innegociables.

docs/architecture.md
    Organización de las capas y responsabilidades.

docs/domain.md
    Conceptos y reglas del negocio.

docs/api.md
    Contratos de comunicación HTTP.

docs/use-cases.md
    Operaciones del sistema.

docs/requirements.md
    Requisitos funcionales y no funcionales.
```

Cuando un cambio de base de datos afecta alguno de estos documentos, deben revisarse y actualizarse según corresponda.

---

# 24. Regla principal

**La base de datos debe preservar la integridad del dominio y de los datos existentes.**

Los cambios de esquema deben ser explícitos, reproducibles y compatibles con las reglas del negocio.

**No modificar la base de datos para solucionar rápidamente un problema de código. Primero entender el impacto; después migrar.**
