# Plan — Edición de participantes

**Spec:** `specs/001-edit-participant/spec.md` (aprobada)
**Estado:** Fase PLAN

---

## 1. Estrategia de implementación

Seguir estrictamente el flujo SDD y la arquitectura por capas existente
(`domain/` sin Express/TypeORM; `server-app/` con HTTP y persistencia).
Reutilizar los patrones ya presentes en participantes y sedes:

- Caso de uso nuevo `UpdateParticipantUseCase` siguiendo el shape de
  `CreateParticipantUseCase` / `UpdateLocationUseCase`.
- Errores nuevos en la familia `AppError` existente.
- Controller nuevo en `ParticipantControllers` siguiendo el patrón de
  `LocationControllers.editLocationName`.
- Ruta nueva `PUT /edit/:participantId` en `participant-api.ts` siguiendo el
  patrón de validación con `express-validator` + `handleInputErrors` +
  `authenticate` + `authorize`.
- Métodos nuevos en `IDatabaseService` implementados en `DatabaseService`.
- Migración con índices únicos (decisión 14 de la spec).
- Tests con Vitest (puerta obligatoria).
- Actualizar `docs/api.md`, `docs/use-cases.md`, `docs/database.md`.

No se crea UI ni funciones de API en el frontend: la spec deja eso fuera de alcance.

---

## 2. Arquitectura afectada

```text
HTTP Request
    ↓
participant-api.ts (route + validación + authn + authz)
    ↓
ParticipantControllers.editParticipant
    ↓
UpdateParticipantUseCase  (dominio)
    ↓
IDatabaseService → DatabaseService → TypeORM → PostgreSQL
```

Capas involucradas: dominio (nuevo use case, nuevos errores), servicios de
dominio (`IDatabaseService`), controllers, rutas/middleware, persistencia
(`DatabaseService`, `ParticipantSchema`, migración) y documentación.

---

## 3. Archivos / áreas principales afectadas

Backend:

- `backend/src/domain/errors/UsersErrors.ts` (o nuevo `ParticipantErrors.ts`)
  → agregar `ParticipantNotFoundError` (code `PARTICIPANT_NOT_FOUND`, 404) y
  `ParticipantInactiveError` (code `PARTICIPANT_INACTIVE`, 400).
- `backend/src/domain/index.ts` → exportar nuevos errores.
- `backend/src/domain/services/IDatabaseService.ts` → agregar
  `getParticipantById(id)`, `getParticipantByEmailAndLocationId(email, locationId)`
  y `updateParticipant(participantId, updateData)`.
- `backend/src/domain/use-cases/participant/UpdateParticipant.ts` (nuevo) →
  `UpdateParticipantUseCase`.
- `backend/src/server-app/services/DatabaseService.ts` → implementar los tres
  métodos siguiendo `getParticipantByDocumentNumberAndLocationId`/`updateLocation`.
- `backend/src/server-app/controllers/ParticipantControllers.ts` → nuevo
  método `editParticipant`.
- `backend/src/server-app/routes/participant-api.ts` → nueva ruta
  `PUT /edit/:participantId` con validaciones express-validator
  (incl. rechazo de campos protegidos y normalización de email).
- `backend/src/server-app/database/schemas/ParticipantSchema.ts` → índices
  únicos `(documentNumber, locationId)` y `(email, locationId)` si se expresa ahí;
  migración formal asociada.
- Migración nueva (ver §5).
- Tests nuevos: caso de uso y endpoint.

Docs: `docs/api.md`, `docs/use-cases.md`, `docs/database.md`.

Frontend: sin cambios de código en esta funcionalidad.

---

## 4. Decisiones técnicas necesarias

1. **Errores de dominio:** reutilizar `AppError`. 
   `ParticipantNotFoundError` → 404, `ParticipantInactiveError` → 400.
   `DocumentNumberAlreadyExistsError` y `EmailAlreadyExistsError` se
   reutilizan (400). Decisión tomada: el mensaje actual de
   `EmailAlreadyExistsError` ("usuario") se mantiene tal cual, sin ajuste.
2. **Métodos de `DatabaseService`:** agregar exactamente los tres métodos
   indicados en la spec, con el mismo patrón try/catch existente.
3. **Normalización de email:** `trim()` + `toLowerCase()` antes de validar,
   comprobar unicidad y persistir (en ruta/validación y/o use case; la regla de
   negocio vive en el caso de uso para no duplicarla).
4. **Campos protegidos en body:** rechazar la solicitud completa con 400
   (RF-007). Se implementa como validación en la ruta
   (`body(...).custom` o middleware de chequeo de claves) más defensa en el
   caso de uso filtrando/rechazando campos no editables.
5. **Solicitud sin campos a modificar:** 400 con mensaje explícito (RF-008).
6. **Campos opcionales `''`/`null`:** `email`, `phone`, `birthDate` → persistir
   `null`; `firstName`, `lastName`, `documentNumber` → 400 (RF-006/RF-009).
7. **Unicidad documento/email por sede:** verificación a nivel de aplicación en
   el use case (`getParticipantByDocumentNumberAndLocationId` existente +
   nuevo `getParticipantByEmailAndLocationId`) excluyendo al propio participante;
   índices únicos en DB como garantía (RF-004/RF-005, decisión 14).
8. **Migraciones vs `synchronize: true`:** decisión tomada — se introduce
   la primera migración formal del proyecto para los índices únicos y se
   documenta la deuda técnica restante, sin cambiar `synchronize` globalmente.
9. **Roles:** `authenticate` + `authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT)`; `'Tutor'` queda excluido (RF-010).
10. **Participante inactivo:** rechazado en el use case con
    `ParticipantInactiveError` (RF-003), con mensaje **"Participante Inactivo"**.
11. **No tocar:** creación, listado, activar/desactivar, estructura de
    `Participant`, relación con `Location`, ni contratos existentes.

---

## 5. Impacto en base de datos

- Agregar índices únicos compuestos:
  - `UNIQUE (documentNumber, locationId)`
  - `UNIQUE (email, locationId)` (los `NULL` no colisionan en PostgreSQL).
- Antes de aplicar la migración: verificar duplicados en datos reales y
  resolverlos (paso manual previo documentado).
- Todo cambio de esquema vía migración; sin cambios destructivos.
- Documentar en `docs/database.md` la nueva restricción y la deuda de
  `synchronize: true`.

---

## 6. Impacto en API

Nuevo endpoint:

```text
PUT /api/participant/edit/:participantId
Auth: authenticate + authorize('Admin','Coordinator','Equipment')
Body: firstName?, lastName?, documentNumber?, birthDate?, email?, phone?
200: participante actualizado
400: validación, campos protegidos, body vacío de editables,
     conflictos de unicidad, participante inactivo
401 / 403 / 404 / 500
```

Sin cambios en contratos existentes. Documentar en `docs/api.md` §23.

---

## 7. Impacto en frontend

- Ninguno en código: la UI queda para una funcionalidad posterior.
- La ruta queda disponible para consumo futuro mediante la capa `api/`.

---

## 8. Estrategia de testing

- Tests unitarios del `UpdateParticipantUseCase`: éxito parcial,
  `ParticipantNotFoundError`, `ParticipantInactiveError`,
  `DocumentNumberAlreadyExistsError` (mismo documento propio OK),
  `EmailAlreadyExistsError`, normalización de email, limpieza de opcionales a
  `null`, preservación de no enviados, campos protegidos rechazados.
- Tests del endpoint: 200, 400 (cada validación), 401, 403 (rol Tutor), 404,
  contrato del body.
- Verificación de que asistencias históricas no se alteran (sin tocar
  `Attendance`).
- Ejecutar `pnpm --filter backend test`, lint y build/tsc.

---

## 9. Riesgos

- `synchronize: true` puede crear/alterar esquema fuera de migraciones;
  riesgo de divergencia. Mitigación: documentar deuda técnica.
- Datos existentes con duplicados de documento/email por sede bloquearían la
  migración; mitigación: verificación previa.
- Normalización de email aplicada de forma inconsistente (ruta vs use case);
  mitigación: regla centralizada en el caso de uso.
- `updateLocation`-style `merge` podría sobrescribir campos protegidos si el
  body no se filtra; mitigación: whitelist estricta en ruta y use case.
- Mensaje de `EmailAlreadyExistsError` habla de "usuario"; riesgo cosmético
  de consistencia. Decisión tomada: se mantiene tal cual.
