# Edición de participantes

**Estado:** borrador

## Objetivo

Permitir que un usuario autorizado modifique la información de un participante existente, preservando la integridad de los datos y del historial de asistencias, y dejando la operación disponible para que el frontend pueda consumirla.

## Alcance

- Modificación de los datos permitidos de un participante existente.
- Validación de los nuevos datos antes de persistirlos.
- Verificación de conflictos de unicidad del documento y del email, ambos por sede.
- Exposición de la operación mediante un endpoint de la API.
- Cobertura de tests del caso de uso y del endpoint.

## Fuera de alcance

- Creación de participantes (ya existe).
- Listado y consulta de participantes (ya existen).
- Activar/desactivar participante: operación independiente; `isActive` no se edita en esta funcionalidad.
- Cambio de sede de un participante (`locationId` no es editable).
- Eliminación física de participantes.
- Cambios en la estructura de la entidad `Participant` o de su relación con `Location` sin una decisión explícita.
- Interfaz de usuario del frontend (queda para una funcionalidad posterior).

## Requisitos funcionales

### RF-001 — Edición exitosa

**Cuando** un usuario autenticado y autorizado (roles `'Admin'`, `'Coordinator'` o `'Equipment'`) envíe una solicitud válida de edición parcial de un participante existente y activo,
**el sistema debe** actualizar únicamente los campos enviados de entre los permitidos (`firstName`, `lastName`, `documentNumber`, `birthDate`, `email`, `phone`) y devolver el participante actualizado. Los campos no enviados conservan su valor actual.

### RF-002 — Participante inexistente

**Si** el identificador de participante no corresponde a un registro existente,
**el sistema debe** rechazar la operación con el error de dominio `ParticipantNotFoundError` (HTTP 404) y no modificar ningún dato.

### RF-003 — Participante inactivo no editable

**Si** el participante está inactivo (`isActive = false`),
**el sistema debe** rechazar la edición con el error de dominio `ParticipantInactiveError` (HTTP 400, mensaje "Participante Inactivo") y no persistir cambios.

### RF-004 — Unicidad de documento por sede

**Si** el nuevo número de documento ya pertenece a otro participante de la misma sede,
**el sistema debe** rechazar la edición con el error de dominio `DocumentNumberAlreadyExistsError` (HTTP 400) y no persistir cambios.

### RF-005 — Unicidad de email por sede

**Si** el nuevo email ya pertenece a otro participante de la misma sede,
**el sistema debe** rechazar la edición con el error de dominio `EmailAlreadyExistsError` (HTTP 400) y no persistir cambios.

### RF-006 — Validaciones de datos

**Si** los datos recibidos no cumplen las validaciones de formato u obligatoriedad,
**el sistema debe** rechazar la solicitud (HTTP 400) antes de ejecutar la operación y no persistir cambios. Las validaciones concretas son:

- `firstName` y `lastName`: si se envían, no pueden quedar vacíos tras `trim()`.
- `documentNumber`: si se envía, no puede quedar vacío tras `trim()`; `''` y `null` se rechazan con 400 (es obligatorio: no admite «limpiar»).
- `email`: si se envía y no es `''` ni `null`, debe cumplir formato de email (`isEmail`) tras normalizarlo (`trim()` + minúsculas). Se persiste normalizado.
- `phone`: si se envía y no es `''` ni `null`, debe tener entre 6 y 20 caracteres y solo contener dígitos, espacios, `+`, `-` o paréntesis.
- `birthDate`: si se envía y no es `''` ni `null`, debe tener formato de fecha ISO 8601 válido.

### RF-007 — Campos no editables en el body

**Si** la solicitud incluye campos no permitidos para edición (`id`, `created_at`, `isActive`, `locationId`, `location`, `role`),
**el sistema debe** rechazar la solicitud completa con HTTP 400 y no persistir ningún cambio. No se ignoran parcialmente: la presencia de cualquier campo protegido invalida la solicitud. En particular, no se permite cambiar la sede del participante ni su estado de actividad mediante esta edición.

### RF-008 — Solicitud sin campos a modificar

**Si** el body de la solicitud no contiene ningún campo editable (objeto vacío o solo con campos protegidos ya rechazados por RF-007),
**el sistema debe** rechazar la solicitud con HTTP 400 y un mensaje indicando que no hay campos a actualizar, sin persistir cambios.

### RF-009 — Tratamiento de campos opcionales vacíos o nulos

**Cuando** se envíen los campos opcionales `email`, `phone` o `birthDate` con valor `''` o `null`,
**el sistema debe** interpretarlos como «limpiar el valor» y persistir `null` en ese campo. Los campos no enviados conservan su valor actual. Se aplica también al caso en que el valor actual no sea nulo: `''` o `null` lo reemplaza por `null`.

### RF-010 — Autorización

**Mientras** el usuario no esté autenticado o no tenga uno de los roles permitidos (`'Admin'`, `'Coordinator'`, `'Equipment'`),
**el sistema debe** rechazar la operación con el error correspondiente (401/403), sin modificar datos. El rol `'Tutor'` no está autorizado para esta operación.

### RF-011 — Disponibilidad para el frontend

**Cuando** la edición esté implementada,
**el sistema debe** exponer el endpoint `PUT /api/participant/edit/:participantId`, registrado dentro de `participant-api.ts` siguiendo el patrón existente, con autenticación y autorización de roles.

## Casos límite

- El participante no existe (id inválido o inexistente) → 404.
- El participante está inactivo → 400 (`ParticipantInactiveError`), sin persistir cambios.
- La solicitud no contiene ningún campo a modificar → 400.
- El body contiene campos protegidos (`id`, `created_at`, `isActive`, `locationId`, `location`, `role`) → 400, sin persistir cambios.
- El número de documento editado coincide con el del propio participante → se permite (no es conflicto).
- El número de documento editado pertenece a otro participante de la misma sede → 400.
- El email editado ya está en uso por otro participante de la misma sede → 400.
- Campos opcionales (`email`, `phone`, `birthDate`) enviados como `''` o `null` → se limpian a `null`.
- `documentNumber`, `firstName` o `lastName` enviados como `''` o `null` → 400.
- Campos con formato inválido (fecha no válida, email no válido, teléfono no válido) → 400.
- Email con mayúsculas/espacios → se normaliza (`trim()` + minúsculas) antes de validar y persistir.
- Usuario sin permisos o no autenticado → 403/401.

## Criterios de aceptación

- [ ] Existe un caso de uso de edición parcial que actualiza únicamente los campos enviados de `firstName`, `lastName`, `documentNumber`, `birthDate`, `email`, `phone`.
- [ ] El caso de uso devuelve `ParticipantNotFoundError` (404) cuando el participante no existe.
- [ ] El caso de uso devuelve `ParticipantInactiveError` (400) cuando el participante está inactivo.
- [ ] El caso de uso valida los datos (obligatoriedad de no vacíos, formato email, formato birthDate ISO 8601, formato phone) y rechaza entradas inválidas con 400.
- [ ] El email se normaliza (`trim()` + minúsculas) antes de validar, comprobar unicidad y persistir.
- [ ] Se verifica la unicidad del documento por sede y se rechaza el conflicto con `DocumentNumberAlreadyExistsError` (400).
- [ ] Se verifica la unicidad del email por sede y se rechaza el conflicto con `EmailAlreadyExistsError` (400).
- [ ] `locationId`, `isActive`, `id`, `created_at`, `location` y `role` no son modificables: su presencia en el body rechaza la solicitud con 400.
- [ ] Una solicitud sin campos a modificar se rechaza con 400.
- [ ] `email`, `phone` y `birthDate` enviados como `''` o `null` se persisten como `null`.
- [ ] El endpoint requiere autenticación y los roles `'Admin'`, `'Coordinator'` y `'Equipment'`; `'Tutor'` recibe 403.
- [ ] El endpoint `PUT /api/participant/edit/:participantId` devuelve las respuestas HTTP consistentes con la API existente (200, 400, 401, 403, 404, 500); los conflictos de unicidad usan 400 al igual que `DocumentNumberAlreadyExistsError` y `EmailAlreadyExistsError` existentes.
- [ ] La edición no modifica `id`, `created_at` ni campos protegidos.
- [ ] La información histórica de asistencias no se ve afectada por la edición.
- [ ] Los tests del caso de uso y del endpoint pasan.

## Reglas de negocio

- Un participante se identifica de forma única por `id`.
- El número de documento no debe repetirse dentro de una misma sede.
- El email no debe repetirse dentro de una misma sede.
- La edición es parcial: solo se actualizan los campos enviados.
- No se puede editar un participante inactivo.
- `isActive` no se modifica en esta funcionalidad (operación separada).
- `locationId` no es editable: no se permite cambiar la sede del participante.
- Los roles permitidos para editar son `'Admin'`, `'Coordinator'` y `'Equipment'` (valores reales de `UserRole`); `'Tutor'` queda excluido.
- La edición no debe eliminar ni alterar registros de asistencia históricos asociados al participante.
- Los campos protegidos (`id`, `created_at`, `isActive`, `locationId`, `location`, `role`) no son modificables: si aparecen en el body, la solicitud se rechaza.
- La autorización se aplica en el backend; el frontend no es la única barrera de seguridad.
- Los campos opcionales vacíos (`''`) o nulos (`null`) limpian su valor; la ausencia del campo lo preserva.

## Restricciones

- Respetar la arquitectura por capas: dominio sin dependencias de Express/TypeORM; controllers sin lógica de negocio.
- No modificar el contrato existente de creación/listado de participantes de forma incompatible.
- Cambios de esquema (si los hubiera) solo mediante migraciones.
- La spec fija el contrato del endpoint (método, ruta, roles) pero no la estructura interna; el detalle de archivos y servicios corresponde al plan.

## Contrato del endpoint

Convención de router: `participant-api.ts` se monta en `/api/participant` (ver `express-app.ts`) y sus rutas internas siguen el patrón existente (p. ej. `/create/:locationId`, `/participants/:locationId`). La nueva ruta se define como `/edit/:participantId` dentro de ese mismo router, quedando la ruta completa `PUT /api/participant/edit/:participantId`.

```text
PUT /api/participant/edit/:participantId

Authentication:
Required (middleware `authenticate`)

Authorization:
Required role(s): 'Admin', 'Coordinator', 'Equipment' (middleware `authorize`)

Path parameters:
- participantId: uuid del participante

Request body (todos los campos opcionales; objeto no vacío; sin campos protegidos):
{
  "firstName": "string, no vacío",
  "lastName": "string, no vacío",
  "documentNumber": "string, no vacío",
  "birthDate": "string ISO 8601 o null/'' para limpiar",
  "email": "string email válido, normalizado, o null/'' para limpiar",
  "phone": "string 6-20 chars o null/'' para limpiar"
}

Response:
200
{
  ...participante actualizado (misma forma que en los endpoints existentes de participantes)
}

Errors:
400 - validación fallida; body sin campos a modificar; campos protegidos presentes;
      conflicto de unicidad (documento o email por sede); participante inactivo
401 - no autenticado
403 - rol no permitido (incluye 'Tutor')
404 - participante no encontrado
500 - error interno
```

## Unicidad documento/email por sede y persistencia

Hoy no existen constraints de unicidad en `ParticipantSchema` (`documentNumber` y `email` son `varchar` sin `unique`). Para garantizar la regla de negocio:

- Se requiere una migración que agregue un índice único compuesto por `(documentNumber, locationId)` y otro por `(email, locationId)`. Nota: en PostgreSQL los `NULL` no colisionan en índices únicos, por lo que múltiples participantes con `email = null` son válidos.
- Antes de aplicar la migración debe verificarse la existencia de duplicados en datos reales; si existen, deben resolverse (desambiguando o eliminando registros) como paso previo a la creación del índice. La migración no debe aplicarse sobre datos duplicados.
- La verificación a nivel de aplicación (RF-004/RF-005) se mantiene como primera barrera; el índice es la garantía a nivel de base de datos y evita condiciones de carrera.

## Impacto

- Backend dominio: nuevo caso de uso de edición; nuevos errores de dominio `ParticipantNotFoundError` (code `PARTICIPANT_NOT_FOUND`, 404) y `ParticipantInactiveError` (code `PARTICIPANT_INACTIVE`, 400) en la familia de errores existente (patrón `AppError`); reutilización de `DocumentNumberAlreadyExistsError` (400) y `EmailAlreadyExistsError` (400).
- Backend persistencia: nuevos métodos en `IDatabaseService` — `getParticipantById(id)`, `getParticipantByEmailAndLocationId(email, locationId)` y `updateParticipant(participantId, updateData)` — implementados en `DatabaseService` siguiendo el patrón existente de `getParticipantByDocumentNumberAndLocationId`/`createParticipant`.
- Backend API: nuevo endpoint de edición, controller, ruta en `participant-api.ts` con `authenticate`, `authorize`, validaciones con `express-validator` y `handleInputErrors`.
- Base de datos: migración con índices únicos `(documentNumber, locationId)` y `(email, locationId)`, con verificación previa de duplicados.
- API: nuevo endpoint de edición de participante, a documentar en `docs/api.md` siguiendo docs/api.md §23.
- Frontend: la funcionalidad queda disponible para consumo futuro; no se crea UI en esta spec.
- Tests: nuevos tests del caso de uso y del endpoint.
- Documentación: actualizar `docs/use-cases.md`, `docs/api.md` y `docs/database.md` cuando se implemente.

## Decisiones tomadas

1. Campos editables: todos excepto `locationId` → `firstName`, `lastName`, `documentNumber`, `birthDate`, `email`, `phone`.
2. No se permite cambiar de sede (`locationId` no se edita).
3. El email tiene unicidad por sede.
4. No se puede editar un participante inactivo: error `ParticipantInactiveError` (HTTP 400).
5. `isActive` no se edita en esta funcionalidad (operación separada).
6. Roles permitidos: `'Admin'`, `'Coordinator'`, `'Equipment'` (valores reales de `UserRole`); `'Tutor'` excluido explícitamente.
7. Edición parcial (solo se actualizan los campos enviados).
8. Endpoint: `PUT /api/participant/edit/:participantId`, registrado en `participant-api.ts` siguiendo el patrón existente.
9. Campos protegidos presentes en el body → rechazo 400 de toda la solicitud (no se ignoran).
10. Solicitud sin campos a modificar → 400.
11. `email`, `phone`, `birthDate` con `''` o `null` → se persiste `null`; omitidos → se conservan. `documentNumber`, `firstName`, `lastName` con `''` o `null` → 400.
12. Email normalizado con `trim()` + minúsculas antes de validar, verificar unicidad y persistir.
13. Conflicto de unicidad (documento o email por sede) → HTTP 400, consistente con `DocumentNumberAlreadyExistsError`/`EmailAlreadyExistsError` existentes (no se adopta 409 para no romper consistencia).
14. Unicidad por sede garantizada a nivel DB mediante migración (la primera migración formal del proyecto) con índices únicos `(documentNumber, locationId)` y `(email, locationId)`, tras resolver duplicados existentes.

## Decisiones pendientes

- Formato concreto aceptado para `phone`: la regla actual (6–20 caracteres, dígitos/espacios/`+`/`-`/paréntesis) es provisional y puede endurecerse en la validación HTTP.

### Decisiones tomadas (resueltas el 2026-10-06)

- Mensaje de `ParticipantInactiveError`: **"Participante Inactivo"**.
- Mensaje de `EmailAlreadyExistsError`: se reutiliza tal cual está (actualmente dice "usuario"), sin ajuste para el contexto de participantes.
- Estrategia de migraciones: esta funcionalidad introduce la **primera migración formal** (para los índices únicos). Se documenta la deuda técnica restante respecto a `synchronize: true`, sin cambiarlo globalmente.
