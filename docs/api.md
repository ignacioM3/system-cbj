# API

Este documento define el contrato de comunicación HTTP entre el frontend y el backend.

La API es la frontera entre la aplicación cliente y el servidor.

Los endpoints, métodos HTTP, autenticación, autorización, formatos de request y response, códigos de estado y errores deben mantenerse sincronizados con la implementación.

---

# 1. Principios

La API debe respetar los siguientes principios:

* Los endpoints representan operaciones del sistema.
* Los controllers adaptan HTTP hacia los casos de uso.
* La lógica de negocio no debe implementarse directamente en las rutas o controllers.
* Los endpoints protegidos requieren autenticación y autorización cuando corresponda.
* Los contratos existentes no deben modificarse sin analizar el impacto sobre sus consumidores.
* Los errores deben utilizar un formato consistente.
* Las validaciones de entrada deben realizarse antes de ejecutar la operación cuando corresponda.
* El frontend consume la API y no accede directamente a la base de datos.

---

# 2. Flujo de una petición

El flujo esperado es:

```text
HTTP Request
     ↓
Route
     ↓
Authentication
     ↓
Authorization
     ↓
Validation
     ↓
Controller
     ↓
Use Case
     ↓
Service / Repository
     ↓
Database
```

No todas las operaciones requieren todos los pasos, pero las rutas protegidas deben respetar el flujo de seguridad correspondiente.

---

# 3. Base URL

La URL base depende del entorno de ejecución.

El frontend debe utilizar la configuración definida para el entorno y no hardcodear URLs de producción dentro del código.

Ejemplo conceptual:

```text
/api
```

La URL concreta debe estar determinada por la configuración del proyecto.

---

# 4. Autenticación

Las operaciones protegidas requieren un usuario autenticado.

El mecanismo de autenticación actual utiliza autenticación basada en tokens.

El frontend debe enviar las credenciales requeridas por el mecanismo de autenticación configurado por el backend.

Conceptualmente:

```text
Client
   ↓
Login
   ↓
Authentication
   ↓
Token
   ↓
Authenticated requests
```

Los endpoints que requieren autenticación deben utilizar el middleware correspondiente.

No eliminar el middleware de autenticación para permitir temporalmente una operación.

---

# 5. Autorización

La autenticación identifica al usuario.

La autorización determina si ese usuario tiene permiso para realizar una operación.

Las rutas protegidas deben utilizar el mecanismo de autorización existente.

Conceptualmente:

```text
Authenticated User
       ↓
      Role
       ↓
Authorization
       ↓
Allowed / Denied
```

La autorización debe ejecutarse en el backend.

Ocultar una opción en el frontend no constituye una medida de seguridad.

---

# 6. Validación de entrada

Los datos recibidos por la API deben validarse antes de ser utilizados.

La validación debe comprobar:

* tipos;
* formatos;
* campos obligatorios;
* valores permitidos;
* restricciones necesarias;
* parámetros de ruta;
* query parameters;
* body.

El backend no debe confiar en que el frontend ya validó los datos.

Las validaciones HTTP deben mantenerse separadas de las reglas de negocio.

---

# 7. Formato de requests

Los endpoints que reciben información mediante body deben utilizar el formato definido por el contrato correspondiente.

Ejemplo conceptual:

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com"
}
```

Los nombres de propiedades deben mantenerse consistentes entre frontend y backend.

No cambiar nombres de campos de un endpoint existente sin analizar el impacto.

---

# 8. Formato de responses

Las respuestas exitosas deben utilizar una estructura consistente con la implementación existente.

Ejemplo conceptual:

```json
{
  "data": {}
}
```

Las listas pueden utilizar una estructura equivalente a:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0
  }
}
```

La estructura real debe mantenerse alineada con los endpoints existentes.

No introducir diferentes formatos de respuesta para operaciones equivalentes sin una razón explícita.

---

# 9. Códigos HTTP

La API debe utilizar códigos HTTP de acuerdo con el resultado de la operación.

Como referencia:

| Código | Uso                                                |
| ------ | -------------------------------------------------- |
| `200`  | Operación exitosa                                  |
| `201`  | Recurso creado                                     |
| `204`  | Operación exitosa sin contenido                    |
| `400`  | Request inválido                                   |
| `401`  | Usuario no autenticado                             |
| `403`  | Usuario autenticado pero sin permisos              |
| `404`  | Recurso no encontrado                              |
| `409`  | Conflicto con el estado existente                  |
| `422`  | Datos semánticamente inválidos, cuando corresponda |
| `500`  | Error interno inesperado                           |

El código utilizado debe corresponder al comportamiento real del endpoint.

No utilizar `200` para representar errores de negocio simplemente para simplificar el frontend.

---

# 10. Errores

Los errores deben mantener una estructura consistente.

Conceptualmente:

```json
{
  "error": {
    "message": "Descripción del error",
    "code": "ERROR_CODE"
  }
}
```

La estructura exacta debe mantenerse alineada con el mecanismo de errores existente.

Los mensajes internos sensibles no deben exponerse al cliente.

Los errores inesperados no deben revelar:

* credenciales;
* tokens;
* contraseñas;
* información sensible;
* stack traces en producción;
* detalles internos de la base de datos.

---

# 11. Endpoints conocidos

Los endpoints deben agruparse conceptualmente por recurso.

Actualmente existe el flujo de creación de usuarios por rol.

### Crear coordinador

```text
POST /users/create/coordinator
```

Responsabilidad:

Crear un usuario con rol de coordinador.

Flujo conceptual:

```text
POST
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Create User Controller
 ↓
Create User Use Case
 ↓
Persistence
```

El endpoint debe respetar las reglas de autenticación y autorización definidas por el sistema.

La creación del usuario no debe duplicar la lógica existente de creación de usuarios.

---

# 12. Users

Los endpoints relacionados con usuarios deben respetar las siguientes responsabilidades:

* crear usuarios;
* consultar usuarios;
* consultar usuarios por rol;
* modificar usuarios;
* activar/desactivar usuarios;
* aplicar las restricciones correspondientes al rol del usuario autenticado.

Existe una operación para obtener usuarios por rol que utiliza paginación.

Conceptualmente:

```text
GET /users
```

con parámetros equivalentes a:

```text
page
limit
role
```

La implementación concreta debe utilizar los nombres y rutas existentes.

El valor por defecto actual de paginación debe mantenerse alineado con la implementación.

No cambiar los valores por defecto sin una decisión explícita.

---

# 13. Locations

Los endpoints de sedes deben permitir las operaciones necesarias para:

* listar sedes;
* consultar una sede;
* crear sedes;
* modificar sedes;
* activar/desactivar sedes;
* consultar información asociada a una sede.

Las operaciones deben respetar los permisos correspondientes al rol autenticado.

El frontend no debe asumir que una sede está activa únicamente porque aparece en una respuesta.

---

# 14. Participants

Los endpoints de participantes deben permitir las operaciones definidas por las funcionalidades activas del sistema.

Las operaciones deben contemplar:

* creación;
* consulta;
* modificación;
* activación/desactivación;
* asociación con sede cuando corresponda;
* consulta de información relacionada con asistencia.

La estructura exacta de los endpoints debe definirse en las specs correspondientes si todavía no existe un contrato implementado.

No inventar endpoints para funcionalidades que todavía no hayan sido especificadas.

## 14.1. Editar participante

```text
PUT /api/participant/edit/:participantId
```

**Autenticación:** requerida mediante token JWT.

**Autorización:** roles `Admin`, `Coordinator` o `Equipment`. El rol `Tutor`
no tiene permiso para esta operación.

**Parámetros de ruta:**

* `participantId`: identificador del participante que se desea editar.

**Request body:** edición parcial; debe incluir al menos uno de estos campos:

```json
{
  "firstName": "María",
  "lastName": "Pérez",
  "documentNumber": "12345678",
  "birthDate": "2000-01-15",
  "email": "maria@example.com",
  "phone": "+54 11 1234-5678"
}
```

Todos los campos son opcionales individualmente. Los campos omitidos conservan
su valor. Enviar `null` o una cadena vacía en `birthDate`, `email` o `phone`
elimina el valor. `firstName`, `lastName` y `documentNumber` no aceptan valores
vacíos. El email se normaliza eliminando espacios externos y convirtiéndolo a
minúsculas.

No se admite modificar `id`, `created_at`, `isActive`, `locationId`,
`location` ni `role`; incluir cualquiera de ellos rechaza la solicitud completa.

**Response exitosa — 200:** devuelve el participante actualizado.

```json
{
  "id": "uuid",
  "firstName": "María",
  "lastName": "Pérez",
  "documentNumber": "12345678",
  "birthDate": "2000-01-15",
  "email": "maria@example.com",
  "phone": "+54 11 1234-5678",
  "locationId": "uuid",
  "isActive": true,
  "created_at": "2026-10-06T12:00:00.000Z"
}
```

**Errores:**

* `400`: body sin campos editables, formato inválido, campo protegido,
  participante inactivo, o documento/email ya utilizado por otro participante
  de la misma sede. Los errores de validación HTTP usan `{ "errors": [...] }`
  y los errores de dominio usan `{ "error": "mensaje" }`.
* `401`: autenticación ausente o token inválido.
* `403`: rol sin permiso.
* `404`: participante inexistente (`{ "error": "Participante no encontrado" }`).
* `500`: error interno no controlado.

---

# 15. Attendance

Los endpoints de asistencia deben permitir las operaciones definidas por el dominio y las specs activas.

Conceptualmente pueden existir operaciones para:

```text
Registrar asistencia
Consultar asistencia
Consultar historial
Filtrar por sede
Filtrar por fecha
Consultar asistencia de un participante
```

Los endpoints concretos deben definirse mediante specs antes de implementarse si todavía no forman parte de la API existente.

---

# 16. Parámetros de ruta

Los identificadores de recursos deben utilizar parámetros de ruta cuando corresponda.

Ejemplo:

```text
GET /locations/:id
```

El parámetro debe:

1. validarse;
2. utilizarse para localizar el recurso;
3. devolver `404` cuando corresponda;
4. respetar las reglas de autorización.

No asumir que conocer el `id` de un recurso implica tener permiso para acceder a él.

---

# 17. Query parameters

Los query parameters deben utilizarse para filtros, paginación y opciones de consulta.

Ejemplo:

```text
GET /users?page=1&limit=10
```

Los parámetros deben validarse.

Los valores inválidos deben generar una respuesta de error apropiada.

No aceptar silenciosamente valores inválidos si eso puede producir resultados inesperados.

---

# 18. Paginación

Las consultas que devuelven grandes cantidades de recursos deben utilizar paginación cuando el contrato lo requiera.

La paginación debe definir claramente:

```text
page
limit
total
results
```

o la estructura equivalente utilizada por el proyecto.

No devolver cantidades ilimitadas de registros desde un endpoint pensado para listados administrativos.

---

# 19. Contrato frontend ↔ backend

El frontend debe consumir la API mediante la capa `api/`.

Conceptualmente:

```text
React Component
      ↓
Feature
      ↓
API function
      ↓
HTTP
      ↓
Backend Endpoint
```

Los componentes no deben duplicar:

* URLs;
* headers;
* lógica de autenticación;
* serialización;
* manejo de errores HTTP.

La lógica común de comunicación debe centralizarse en las abstracciones existentes.

---

# 20. Cambios en la API

Modificar un endpoint existente puede afectar:

* backend;
* frontend;
* tests;
* documentación;
* integraciones externas.

Antes de modificar un contrato existente se debe identificar todos los consumidores.

Los cambios incompatibles deben formar parte de una spec explícita.

Ejemplos de cambios potencialmente incompatibles:

* cambiar método HTTP;
* cambiar URL;
* eliminar un campo;
* renombrar un campo;
* cambiar el tipo de un campo;
* cambiar códigos HTTP esperados;
* modificar la estructura de la response;
* cambiar requisitos de autenticación;
* cambiar permisos requeridos.

---

# 21. Versionado

No introducir versionado de API únicamente por seguir una convención.

Si el proyecto requiere versionado futuro, debe definirse mediante una decisión arquitectónica y documentarse antes de implementarlo.

Mientras no exista una estrategia de versionado aprobada, mantener el contrato actual.

---

# 22. Seguridad

Nunca incluir en responses:

* contraseñas;
* hashes de contraseña;
* tokens privados;
* secretos;
* información interna de infraestructura.

Las respuestas deben devolver únicamente la información necesaria para la operación solicitada.

Los endpoints administrativos deben verificar autenticación y autorización.

La API nunca debe confiar exclusivamente en restricciones implementadas por el frontend.

---

# 23. Documentación de nuevos endpoints

Un nuevo endpoint debe documentarse antes o como parte de su implementación.

La documentación debe incluir como mínimo:

```text
Método HTTP
Ruta
Autenticación
Autorización
Parámetros
Request body
Response
Códigos HTTP
Errores
```

Ejemplo:

```text
POST /resource

Authentication:
Required

Authorization:
Required role(s)

Request:
{
  ...
}

Response:
201
{
  ...
}

Errors:
400
401
403
409
```

---

# 24. Reglas para agentes

Antes de modificar la API, el agente debe:

1. Revisar la spec activa.
2. Revisar este documento.
3. Buscar el endpoint existente relacionado.
4. Revisar route, middleware, controller y use case.
5. Identificar consumidores en el frontend.
6. Evaluar cambios de contrato.
7. Realizar el cambio mínimo necesario.
8. Ejecutar tests correspondientes.
9. Actualizar la documentación si cambia el contrato.

El agente no debe:

* inventar endpoints sin necesidad;
* cambiar contratos existentes sin analizar consumidores;
* eliminar autenticación;
* eliminar autorización;
* colocar lógica de negocio en controllers;
* devolver información sensible;
* modificar respuestas únicamente para facilitar una implementación del frontend.

---

# 25. Decisiones pendientes

Las siguientes decisiones deben definirse mediante specs o documentación específica antes de implementar funcionalidades que dependan de ellas:

* contrato completo de autenticación;
* endpoints definitivos de usuarios;
* permisos exactos por endpoint;
* endpoints definitivos de participantes;
* endpoints definitivos de sedes;
* endpoints definitivos de asistencia;
* estructura estándar definitiva de responses;
* estructura estándar definitiva de errores;
* estrategia de paginación global;
* estrategia de versionado;
* flujo definitivo de registro de asistencia mediante QR.

El agente no debe inventar estas decisiones.

---

# 26. Documentación relacionada

```text
docs/constitution.md
    Principios innegociables.

docs/architecture.md
    Arquitectura y responsabilidades de las capas.

docs/domain.md
    Conceptos y reglas del negocio.

docs/database.md
    Persistencia, entidades, relaciones y migraciones.

docs/use-cases.md
    Operaciones de aplicación.

docs/requirements.md
    Requisitos funcionales y no funcionales.
```

---

# 27. Regla principal

**La API es un contrato.**

Un endpoint no es solamente una URL: define cómo el frontend y el backend se comunican.

Cualquier cambio en ese contrato debe ser intencional, documentado, validado y compatible con las reglas de seguridad y del dominio.

**No cambiar el contrato para solucionar rápidamente un problema de implementación.**
