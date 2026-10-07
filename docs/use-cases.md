# Use Cases

## Propósito

Este documento define los casos de uso principales del sistema y las reglas generales para organizar la lógica de aplicación.

Los Use Cases representan **acciones que el sistema puede realizar** y coordinan el flujo necesario para cumplirlas.

Un Use Case puede utilizar entidades del dominio, servicios, repositorios u otras abstracciones necesarias, pero no debe depender directamente de detalles de infraestructura cuando exista una abstracción disponible.

Este documento define **qué operaciones existen y qué responsabilidad tienen**.

La implementación concreta debe respetar:

* `docs/constitution.md`
* `docs/architecture.md`
* `docs/domain.md`
* `docs/database.md`
* `docs/api.md`
* las especificaciones correspondientes dentro de `specs/`

---

# 1. Principios

## 1.1. Un Use Case representa una acción

Un Use Case debe representar una operación significativa para el sistema.

Ejemplos:

* Crear usuario.
* Obtener usuarios por rol.
* Crear una sede.
* Obtener una sede.
* Registrar una asistencia.
* Obtener historial de asistencias.

No debe existir un Use Case simplemente para envolver una llamada técnica sin aportar comportamiento de aplicación.

---

## 1.2. Un Use Case coordina, no almacena

El Use Case no debe convertirse en una capa de acceso directo a la base de datos.

Su responsabilidad es coordinar el flujo:

```text
Entrada
  ↓
Validación de reglas de aplicación
  ↓
Consulta/modificación mediante abstracciones
  ↓
Reglas de negocio necesarias
  ↓
Resultado
```

El acceso a PostgreSQL y TypeORM pertenece a la infraestructura.

---

## 1.3. Los Use Cases no dependen de HTTP

Los Use Cases no deben conocer:

* `Request`
* `Response`
* Express
* códigos HTTP
* headers
* cookies
* rutas
* detalles específicos del frontend

La comunicación HTTP pertenece a:

```text
Routes
    ↓
Controllers
    ↓
Use Cases
```

Por lo tanto, un Use Case debe poder ejecutarse sin necesidad de levantar un servidor HTTP.

---

# 2. Ubicación dentro de la arquitectura

El flujo general del backend es:

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

El Use Case ocupa el lugar central de la lógica de aplicación.

Su responsabilidad es coordinar:

* entrada de datos;
* reglas de aplicación;
* entidades del dominio;
* servicios;
* repositorios;
* manejo de errores;
* resultado de la operación.

---

# 3. Estructura conceptual

Cada Use Case debería tener una responsabilidad clara.

Conceptualmente:

```text
UseCase
├── Input
├── ejecución
└── Output
```

Ejemplo conceptual:

```ts
type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};
```

Y el resultado puede representar:

```ts
type CreateUserOutput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};
```

La estructura concreta debe seguir los patrones existentes en el proyecto.

No se deben introducir nuevos patrones innecesariamente.

---

# 4. Separación de responsabilidades

## Route

Define cómo se accede al endpoint.

Responsabilidad:

* método HTTP;
* path;
* middleware;
* conexión con controller.

No contiene lógica de negocio.

---

## Controller

Responsabilidad:

* recibir la petición;
* obtener parámetros/body/query;
* ejecutar el Use Case;
* transformar el resultado a una respuesta HTTP.

No debe contener la lógica principal del negocio.

---

## Use Case

Responsabilidad:

* ejecutar una operación del sistema;
* coordinar servicios y repositorios;
* aplicar reglas de aplicación;
* manejar errores de negocio/aplicación;
* devolver un resultado.

---

## Service / Repository

Responsabilidad:

* acceso a datos;
* persistencia;
* consultas;
* comunicación con infraestructura externa cuando corresponda.

El Use Case no debería conocer detalles internos de TypeORM o PostgreSQL.

---

# 5. Usuarios

Los usuarios representan personas que pueden autenticarse y operar dentro del sistema según su rol.

Los Use Cases relacionados con usuarios deben respetar las reglas definidas en `docs/domain.md`.

---

## 5.1. Crear usuario

### Objetivo

Crear un nuevo usuario dentro del sistema.

### Responsabilidades

El Use Case debe:

1. recibir los datos necesarios;
2. validar las reglas correspondientes;
3. comprobar conflictos relevantes;
4. preparar la información necesaria;
5. crear el usuario;
6. devolver el resultado.

### Reglas

Debe respetar:

* email único;
* contraseña segura;
* rol válido;
* estado inicial correspondiente;
* campos obligatorios;
* reglas de autorización del actor que realiza la operación.

La contraseña nunca debe almacenarse en texto plano.

---

## 5.2. Crear coordinador

Existe actualmente una operación específica para crear coordinadores.

Endpoint conocido:

```text
POST /users/create/coordinator
```

El Use Case correspondiente debe respetar las reglas de creación de usuarios y las reglas específicas del rol `coordinator`.

No debe asumirse que todos los usuarios deben crearse mediante este Use Case.

Si aparecen nuevos roles con flujos de creación diferentes, deben definirse mediante una especificación.

---

## 5.3. Obtener usuario

### Objetivo

Obtener información de un usuario existente.

Puede utilizarse para:

* consultar información;
* obtener detalles;
* validar relaciones;
* soportar otros casos de uso.

El Use Case debe evitar devolver información sensible innecesaria.

Especialmente:

* contraseñas;
* hashes;
* credenciales;
* tokens;
* información interna de seguridad.

---

## 5.4. Obtener usuarios por rol

Existe actualmente una operación para obtener usuarios filtrados por rol.

Debe soportar paginación cuando corresponda.

Actualmente existe el concepto:

```text
page
limit
role
```

Y existe un valor por defecto conocido para la consulta:

```text
page = 1
limit = 6
```

Estos valores deben mantenerse alineados con la implementación actual hasta que una especificación determine un cambio.

---

## 5.5. Actualizar usuario

### Objetivo

Modificar información permitida de un usuario.

El Use Case debe:

1. localizar el usuario;
2. comprobar que existe;
3. validar los nuevos datos;
4. aplicar las modificaciones permitidas;
5. persistir el resultado.

No debe permitir modificar información protegida simplemente porque aparezca en el request.

Los campos modificables deben estar definidos por la especificación correspondiente.

---

## 5.6. Activar usuario

### Objetivo

Volver a habilitar un usuario previamente inactivo.

Debe respetar las reglas de ciclo de vida del usuario.

---

## 5.7. Desactivar usuario

### Objetivo

Deshabilitar un usuario sin eliminar necesariamente sus registros históricos.

La desactivación debe utilizarse cuando el sistema necesite conservar la información asociada al usuario.

No debe interpretarse automáticamente como eliminación física.

---

# 6. Autenticación

La autenticación permite comprobar la identidad de un usuario.

El flujo conceptual es:

```text
Credenciales
    ↓
Buscar usuario
    ↓
Validar existencia
    ↓
Validar estado
    ↓
Verificar contraseña
    ↓
Generar sesión/token
    ↓
Resultado de autenticación
```

El Use Case de autenticación no debe contener detalles específicos de Express.

La generación y validación de tokens debe realizarse mediante servicios o abstracciones apropiadas.

---

# 7. Autorización

La autenticación y la autorización son responsabilidades diferentes.

```text
Autenticación
→ ¿Quién es el usuario?

Autorización
→ ¿Qué puede hacer ese usuario?
```

Los Use Cases deben respetar las reglas de autorización.

Sin embargo, la autorización asociada a HTTP puede ser aplicada mediante middleware.

Por ejemplo:

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

El Use Case no debe asumir que cualquier usuario puede ejecutar cualquier operación.

Las reglas específicas de permisos deben estar definidas por el dominio o la especificación correspondiente.

---

# 8. Sedes / Locations

Las sedes representan los lugares donde se desarrolla la actividad del sistema.

---

## 8.1. Crear sede

### Objetivo

Crear una nueva sede.

Debe contemplar:

* nombre;
* dirección;
* estado inicial;
* reglas de unicidad o validación que determine la especificación.

No deben inventarse restricciones que no estén definidas.

---

## 8.2. Obtener sede

### Objetivo

Obtener información de una sede específica.

Debe devolver solamente la información necesaria para la operación solicitada.

---

## 8.3. Obtener sedes

### Objetivo

Obtener las sedes disponibles para el sistema.

Puede incluir:

* búsqueda;
* filtros;
* paginación;
* estado activo/inactivo.

Estas capacidades deben implementarse únicamente cuando estén definidas por la especificación correspondiente.

---

## 8.4. Actualizar sede

### Objetivo

Modificar información permitida de una sede.

Debe:

1. localizar la sede;
2. verificar que existe;
3. validar los nuevos datos;
4. aplicar los cambios;
5. persistirlos.

---

## 8.5. Activar sede

Permite volver a habilitar una sede previamente desactivada.

---

## 8.6. Desactivar sede

Permite deshabilitar una sede sin eliminar necesariamente la información histórica asociada.

La desactivación no debe implicar automáticamente un `DELETE`.

---

# 9. Participantes

Los participantes representan a las personas que forman parte de las actividades registradas por el sistema.

Un participante no debe confundirse automáticamente con un usuario autenticable.

La diferencia conceptual es:

```text
User
→ persona que puede utilizar el sistema.

Participant
→ persona cuya participación/asistencia registra el sistema.
```

La estructura definitiva de Participant debe respetar `docs/domain.md` y la especificación correspondiente.

---

## 9.1. Crear participante

### Objetivo

Registrar un nuevo participante.

Debe:

1. validar los datos;
2. comprobar conflictos relevantes;
3. crear el participante;
4. devolver el resultado.

No deben inventarse campos adicionales.

---

## 9.2. Obtener participante

Permite consultar un participante específico.

---

## 9.3. Obtener participantes

Permite listar participantes.

Dependiendo de la especificación puede incluir:

* búsqueda;
* filtros;
* sede;
* estado;
* paginación.

Estas capacidades no deben asumirse como obligatorias hasta que estén definidas.

---

## 9.4. Actualizar participante

`UpdateParticipantUseCase` permite modificar parcialmente la información de un
participante existente.

### Entrada

Recibe el identificador del participante y al menos uno de estos campos:

* `firstName`;
* `lastName`;
* `documentNumber`;
* `birthDate`;
* `email`;
* `phone`.

### Flujo y reglas

1. Rechaza campos protegidos y solicitudes sin campos editables.
2. Valida y normaliza únicamente los campos enviados.
3. Comprueba que el participante exista y esté activo.
4. Conserva la sede actual; `locationId` no es editable.
5. Comprueba que documento y email sean únicos dentro de esa sede, excluyendo
   al propio participante.
6. Persiste únicamente los campos enviados y devuelve el participante
   actualizado.

`email`, `phone` y `birthDate` pueden limpiarse mediante `null` o una cadena
vacía. El email no vacío se persiste en minúsculas y sin espacios externos.
`isActive` se administra mediante una operación separada.

### Errores esperados

* `ParticipantNotFoundError`: no existe el participante.
* `ParticipantInactiveError`: el participante está inactivo.
* `DocumentNumberAlreadyExistsError`: documento duplicado en la sede.
* `EmailAlreadyExistsError`: email duplicado en la sede.
* errores de datos inválidos, campos protegidos o ausencia de cambios.

---

## 9.5. Activar / desactivar participante

Permite administrar el estado del participante sin eliminar necesariamente sus registros históricos.

---

# 10. Asistencias

La asistencia es uno de los conceptos principales del sistema.

Conceptualmente una asistencia relaciona:

```text
Participant
    +
Location
    +
Date / Time
```

El modelo exacto debe respetar `docs/domain.md` y `docs/database.md`.

---

## 10.1. Registrar asistencia

### Objetivo

Registrar que un participante asistió a una actividad o sede.

El flujo conceptual es:

```text
Solicitud de asistencia
        ↓
Identificar participante
        ↓
Identificar sede
        ↓
Validar condiciones
        ↓
Comprobar duplicación
        ↓
Registrar asistencia
        ↓
Resultado
```

El Use Case debe aplicar las reglas correspondientes antes de persistir la asistencia.

---

## 10.2. Validar asistencia duplicada

Antes de registrar una asistencia, el sistema debe comprobar si existe una asistencia equivalente cuando dicha restricción esté definida.

La definición exacta de duplicación todavía es una decisión pendiente.

Por ejemplo, podría depender de:

```text
participant + location + date
```

pero esta regla **no debe asumirse como definitiva** hasta que exista una especificación que la confirme.

---

## 10.3. Obtener asistencia

Permite consultar una asistencia específica.

---

## 10.4. Obtener historial de asistencia

### Objetivo

Consultar las asistencias registradas.

Puede utilizar filtros como:

* participante;
* sede;
* fecha;
* rango de fechas.

Los filtros definitivos deben estar definidos por la especificación correspondiente.

---

## 10.5. Obtener asistencia del día

El sistema contempla un dashboard que puede mostrar las asistencias correspondientes al día actual.

Este Use Case debe:

1. determinar el período correspondiente;
2. consultar las asistencias;
3. aplicar filtros permitidos;
4. devolver los resultados.

La definición exacta de zona horaria y período diario debe establecerse explícitamente antes de implementar reglas complejas relacionadas con fechas.

---

# 11. QR de asistencia

El sistema utiliza un flujo basado en QR para facilitar el registro de asistencia.

Conceptualmente:

```text
QR
 ↓
Identificación / acceso
 ↓
Validación
 ↓
Registro de asistencia
```

El QR no debe considerarse automáticamente como una regla de negocio independiente.

Antes de implementar el flujo definitivo deben definirse:

* qué información contiene el QR;
* si identifica al participante;
* si identifica la sede;
* si contiene un token;
* duración del token;
* expiración;
* posibilidad de reutilización;
* protección contra falsificación;
* necesidad de autenticación.

Estas decisiones deben quedar documentadas en una especificación.

---

# 12. Reglas de errores

Los Use Cases deben utilizar errores significativos.

Ejemplos conceptuales:

```text
UserNotFoundError
EmailAlreadyExistsError
LocationNotFoundError
ParticipantNotFoundError
AttendanceAlreadyExistsError
InvalidCredentialsError
UnauthorizedOperationError
```

Los nombres concretos deben seguir los errores ya existentes en el proyecto.

No deben crearse múltiples errores diferentes para representar exactamente la misma situación.

---

# 13. Validación

La validación puede existir en diferentes niveles.

```text
HTTP/Input Validation
        ↓
Application Validation
        ↓
Domain Rules
        ↓
Persistence Constraints
```

Cada capa tiene una responsabilidad diferente.

### Controller / Middleware

Puede validar:

* formato;
* tipos;
* campos requeridos;
* estructura del request.

### Use Case

Debe validar:

* condiciones necesarias para ejecutar la operación;
* existencia de entidades;
* conflictos;
* reglas de aplicación.

### Domain

Debe proteger reglas fundamentales del negocio.

### Database

Debe proteger la integridad de los datos mediante:

* constraints;
* foreign keys;
* unique constraints;
* tipos;
* relaciones.

No debe dependerse exclusivamente de una sola capa.

---

# 14. Transacciones

Un Use Case que modifica varias entidades relacionadas puede requerir una transacción.

Ejemplo conceptual:

```text
Use Case
   ↓
Operación A
   ↓
Operación B
   ↓
Operación C
```

Si todas forman parte de una única operación lógica, debe evaluarse si necesitan ejecutarse de forma atómica.

La implementación de transacciones pertenece a la infraestructura, pero la decisión de que una operación debe ser atómica pertenece a la lógica de aplicación/dominio.

No deben introducirse transacciones innecesarias.

---

# 15. Composición de Use Cases

Un Use Case puede utilizar otro servicio o abstracción cuando tenga sentido.

Sin embargo, no debe crearse una cadena innecesariamente compleja:

```text
UseCase A
 ↓
UseCase B
 ↓
UseCase C
 ↓
UseCase D
```

La composición debe utilizarse únicamente cuando represente una necesidad real del sistema.

Antes de reutilizar un Use Case existente debe comprobarse si:

* la responsabilidad realmente coincide;
* las reglas son compatibles;
* no se está acoplando una operación a otra innecesariamente.

---

# 16. Reutilización

Antes de crear un nuevo Use Case, el agente debe comprobar si existe uno que ya resuelva la misma responsabilidad.

No se deben crear duplicados como:

```text
GetUser
GetUserById
FindUser
RetrieveUser
```

si todos representan la misma operación.

La nomenclatura debe seguir las convenciones existentes del proyecto.

---

# 17. Testing

Cada Use Case importante debe tener pruebas.

Las pruebas deben comprobar principalmente:

* caso exitoso;
* entradas inválidas;
* entidad inexistente;
* conflictos;
* reglas de negocio;
* errores esperados;
* comportamiento ante casos límite relevantes.

Ejemplo conceptual:

```text
CreateUserUseCase
├── creates user successfully
├── rejects duplicate email
├── rejects invalid data
└── handles persistence failure
```

Las pruebas deben verificar comportamiento, no detalles internos innecesarios.

---

# 18. Dependencias

Los Use Cases deben depender de abstracciones cuando sea necesario.

Ejemplo conceptual:

```text
Use Case
   ↓
IUserRepository
   ↓
UserRepository
   ↓
TypeORM
   ↓
PostgreSQL
```

No debe ocurrir:

```text
Use Case
   ↓
TypeORM Repository
```

si esto rompe la separación definida por la arquitectura.

El dominio y la lógica de aplicación no deben quedar acoplados innecesariamente a PostgreSQL, TypeORM o Express.

---

# 19. Reglas para agentes de IA

Cuando un agente trabaje sobre un Use Case debe seguir este proceso:

### Paso 1 — Entender

Leer:

```text
docs/constitution.md
docs/architecture.md
docs/domain.md
docs/database.md
docs/api.md
docs/use-cases.md
```

y después la especificación correspondiente.

---

### Paso 2 — Buscar implementación existente

Antes de crear un Use Case:

* buscar operaciones similares;
* revisar convenciones;
* revisar errores existentes;
* revisar interfaces;
* revisar tests;
* revisar servicios/repositorios existentes.

---

### Paso 3 — Verificar la spec

El agente debe comprobar:

* objetivo;
* entrada;
* salida;
* reglas;
* errores;
* permisos;
* efectos secundarios;
* criterios de aceptación.

---

### Paso 4 — Implementar lo mínimo

Debe realizar únicamente los cambios necesarios para cumplir la tarea.

No debe:

* refactorizar archivos no relacionados;
* cambiar arquitectura;
* modificar endpoints sin necesidad;
* agregar funcionalidades no solicitadas;
* cambiar reglas de negocio sin especificación.

---

### Paso 5 — Probar

Ejecutar los tests correspondientes.

Si existe un fallo relacionado con el cambio, debe investigarse.

---

### Paso 6 — Informar

El agente debe indicar:

* qué cambió;
* qué tests ejecutó;
* resultado de los tests;
* problemas encontrados;
* decisiones que quedaron pendientes.

---

# 20. Decisiones pendientes

Actualmente existen decisiones que no deben ser inventadas por el agente.

Entre ellas:

* estructura definitiva de `Participant`;
* relación exacta entre `User` y `Location`;
* relación exacta entre `Participant` y `Location`;
* permisos definitivos por rol;
* reglas para acceso a múltiples sedes;
* reglas exactas para asistencia duplicada;
* posibilidad de modificar/eliminar asistencias;
* estrategia definitiva del QR;
* expiración y seguridad del QR;
* reglas de asistencia mediante QR;
* zona horaria utilizada para determinar "hoy";
* filtros definitivos del dashboard;
* estructura final de respuestas de los Use Cases.

Mientras estas decisiones no estén definidas, el agente debe:

1. identificar la incertidumbre;
2. evitar asumir una regla;
3. consultar la especificación correspondiente;
4. si no existe, solicitar una decisión antes de implementar comportamiento nuevo.

---

# 21. Relación con otros documentos

Los Use Cases deben mantenerse alineados con:

```text
docs/constitution.md
        ↓
docs/architecture.md
        ↓
docs/domain.md
        ↓
docs/database.md
        ↓
docs/api.md
        ↓
docs/use-cases.md
        ↓
specs/
```

Las especificaciones de cada feature tienen prioridad para definir el comportamiento concreto de esa feature.

Este documento define la estructura y las responsabilidades generales.

---

# 22. Regla principal

> Un Use Case representa una acción significativa del sistema y coordina la lógica necesaria para ejecutarla, sin depender directamente de HTTP ni de detalles de infraestructura.

El objetivo es mantener una aplicación donde:

```text
Controller
    ↓
Use Case
    ↓
Domain / Abstractions
    ↓
Infrastructure
```

sea claro, testeable y mantenible.

**Entender primero, modificar después.**
