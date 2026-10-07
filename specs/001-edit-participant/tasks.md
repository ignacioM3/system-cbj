# Tasks — Edición de participantes

**Spec:** `specs/001-edit-participant/spec.md`
**Plan:** `specs/001-edit-participant/plan.md`

Orden sugerido: T1 → T10. Cada tarea debe terminar con tests pasando
(`pnpm --filter backend test`) y TypeScript compilando antes de pasar a la
siguiente.

---

## T1 — Nuevos errores de dominio ✅ (completada)

- **Objetivo:** agregar `ParticipantNotFoundError` (404, `PARTICIPANT_NOT_FOUND`)
  y `ParticipantInactiveError` (400, `PARTICIPANT_INACTIVE`) en la familia
  `AppError`, exportándolos desde `domain/index.ts`.
- **Archivos:** `backend/src/domain/errors/UsersErrors.ts` (o nuevo
  `ParticipantErrors.ts`), `backend/src/domain/index.ts`.
- **Cubre:** RF-002, RF-003.
- **Criterio:** errores instanciables con `message`, `code`, `statusCode`
  correctos (mensaje de `ParticipantInactiveError`: "Participante Inactivo");
  imports funcionando.

## T2 — Métodos nuevos en IDatabaseService ✅ (completada)

- **Objetivo:** declarar `getParticipantById(id)`,
  `getParticipantByEmailAndLocationId(email, locationId)` y
  `updateParticipant(participantId, updateData)` en la interfaz.
- **Archivos:** `backend/src/domain/services/IDatabaseService.ts`.
- **Cubre:** RF-001, RF-002, RF-004, RF-005.
- **Criterio:** la interfaz compila (los implementadores pueden quedar rotos
  hasta T3).

## T3 — Implementación en DatabaseService ✅ (completada)

- **Objetivo:** implementar los tres métodos siguiendo el patrón existente
  (`getParticipantByDocumentNumberAndLocationId`, `updateLocation`).
- **Archivos:** `backend/src/server-app/services/DatabaseService.ts`.
- **Cubre:** RF-001, RF-002, RF-005.
- **Criterio:** compila, respeta try/catch y tipos; `updateParticipant` hace
  merge + save sobre el participante existente y lanza `ParticipantNotFoundError`
  si no existe.

## T4 — UpdateParticipantUseCase (tests primero) ✅ (completada)

- **Objetivo:** caso de uso de edición parcial con: búsqueda por id,
  404, rechazo de inactivo (400), unicidad de documento por sede (excluyendo
  el propio participante), unicidad de email por sede, normalización de email,
  limpieza de `email`/`phone`/`birthDate` con `''`/`null`, persistencia solo de
  campos enviados.
- **Archivos:** `backend/src/domain/use-cases/participant/UpdateParticipant.ts`
  (nuevo), test nuevo (p. ej. `UpdateParticipant.test.ts`).
- **Cubre:** RF-001, RF-002, RF-003, RF-004, RF-005, RF-006 (parte de dominio),
  RF-009.
- **Criterio:** todos los tests del caso de uso pasan; no depende de
  Express/TypeORM.

## T5 — Controller editParticipant ✅ (completada)

- **Objetivo:** método `editParticipant` en `ParticipantControllers` que tome
  `participantId` de params y el body, invoque el use case y responda 200;
  propagación de errores de dominio vía `createHandler`.
- **Archivos:** `backend/src/server-app/controllers/ParticipantControllers.ts`.
- **Cubre:** RF-001, RF-002, RF-003.
- **Criterio:** compila; el controller no contiene lógica de negocio.

## T6 — Ruta PUT /edit/:participantId con validaciones ✅ (completada)

- **Objetivo:** registrar la ruta en `participant-api.ts` con `authenticate`,
  `authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT)`,
  validaciones express-validator (trim/notEmpty condicional, `isEmail` tras
  normalizar, `isISO8601`, formato phone 6–20), rechazo 400 de campos
  protegidos (`id`, `created_at`, `isActive`, `locationId`, `location`,
  `role`), rechazo 400 si no hay campos editables, y `handleInputErrors`.
- **Archivos:** `backend/src/server-app/routes/participant-api.ts`.
- **Cubre:** RF-006, RF-007, RF-008, RF-010, RF-011.
- **Criterio:** ruta montada bajo `/api/participant`; 'Tutor' recibe 403.

## T7 — Tests del endpoint ✅ (completada)

- **Objetivo:** tests HTTP del endpoint: 200 edición exitosa, 400 por cada
  validación (formato, protegidos, sin campos, inactivo, duplicados), 401,
  403 (Tutor), 404.
- **Archivos:** test nuevo de la ruta (p. ej. `participant-api.test.ts`).
- **Cubre:** RF-001..RF-011, criterios de aceptación del endpoint.
- **Criterio:** suite pasando; contrato JSON consistente con endpoints
  existentes.

## T8 — Migración de índices únicos ✅ (completada)

- **Objetivo:** crear la primera migración formal del proyecto con índice
  único `(documentNumber, locationId)` y `(email, locationId)`; verificar
  previamente duplicados en datos reales; documentar la deuda técnica
  restante respecto a `synchronize: true`.
- **Archivos:** nuevo archivo de migración, `backend/src/server-app/database/schemas/ParticipantSchema.ts` si corresponde.
- **Cubre:** RF-004, RF-005, decisión 14.
- **Criterio:** migración aplicable en limpio y reversible; tests no afectados.

## T9 — Documentación ✅ (completada)

- **Objetivo:** actualizar `docs/api.md` (contrato del endpoint §23),
  `docs/use-cases.md` (UpdateParticipant) y `docs/database.md` (índices únicos,
  deuda de `synchronize`).
- **Archivos:** `docs/api.md`, `docs/use-cases.md`, `docs/database.md`.
- **Cubre:** §Impacto de la spec.
- **Criterio:** docs sincronizadas con el contrato implementado.

## T10 — Validación final ✅ (completada)

- **Objetivo:** ejecutar suite completa (`pnpm --filter backend test`), lint,
  build/tsc y verificar que no se tocaron contratos existentes ni lógica de
  asistencias.
- **Archivos:** —
- **Cubre:** todos los RF.
- **Criterio:** tests verdes, build OK, nada de código no relacionado modificado.
