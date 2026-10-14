# Tasks — Alternancia del estado de un participante

**Spec:** `specs/002-toggle-participant-status/spec.md` (aprobada)
**Plan:** `specs/002-toggle-participant-status/plan.md` (aprobado)
**Estado:** tareas T1-T8 completadas; validación final APROBADA

## Bloqueo previo obligatorio

La suite backend tiene 14 fallos de la línea base vinculados con la spec 001. Ninguna tarea de esta lista puede comenzar hasta que esos fallos se resuelvan fuera de la spec 002 y `pnpm --dir backend test` pase completamente.

No se agregarán aquí tareas para corregir la spec 001. `ParticipantStatusConflictError` y su test específico ya existentes se conservan, pero no se consideran completos mientras la línea base permanezca roja.

Orden condicionado a línea base verde: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8. Cada tarea sigue TDD y debe detenerse al completarse.

## Atribución del working tree

El working tree ya contenía cambios preexistentes o del usuario antes de iniciar
la implementación de la spec 002. Entre ellos estaban la operación paginada de
participantes en archivos compartidos, `GetParticipantsPaginatedUseCase`,
modificaciones en frontend y `.opencode/agents/**`, y el cambio de
`AuthControllers.ts` que incluye `console.log(req.user)`.

Las ejecuciones T1-T8 no introdujeron ni modificaron esas operaciones o cambios
ajenos y tampoco los revirtieron. La revisión de alcance de T8 se refiere a los
cambios atribuibles a la spec 002, no a que el working tree completo estuviera
limpio.

## [x] T1 - Verificar y cerrar el error 409 conservado

- RF: RF-008
- Objetivo: validar la implementación parcial conservada de `ParticipantStatusConflictError` sin duplicarla ni asumir que está completa por su test aislado.
- Archivos/áreas: `backend/src/domain/errors/ParticipantErrors.ts`; `backend/src/domain/errors/__tests__/ParticipantErrors.test.ts`; `backend/src/domain/index.ts` solo para verificar el export existente.
- Dependencias: línea base backend restaurada externamente y suite completa verde.
- Hecho cuando:
  - [x] Antes de iniciar, `pnpm --dir backend test` pasa completamente.
  - [x] Se confirma que el código y el test parciales existentes se conservaron y no se duplicaron.
  - [x] El error extiende `AppError`, usa código estable y status 409.
  - [x] El test específico y la suite backend completa pasan.

## [x] T2 - Implementar la comprobación consultiva previa

- RF: RF-003, RF-004
- Objetivo: comprobar existencia antes de auth mediante una capa de aplicación que no modifique ni exponga al participante.
- Archivos/áreas: nuevos `backend/src/domain/use-cases/participant/EnsureParticipantExistsUseCase.ts` y `backend/src/domain/use-cases/participant/__tests__/EnsureParticipantExistsUseCase.test.ts`.
- Dependencias: T1.
- Hecho cuando:
  - [x] Los tests se escriben antes de la implementación.
  - [x] Un participante existente permite continuar sin devolver sus datos al cliente.
  - [x] Un UUID válido inexistente produce `ParticipantNotFoundError`.
  - [x] El caso de uso usa `IDatabaseService.getParticipantById`, no modifica datos y no depende de HTTP, Express o TypeORM.
  - [x] Los tests específicos y la suite backend completa pasan.

## [x] T3 - Implementar la alternancia atómica en persistencia

- RF: RF-001, RF-002, RF-003, RF-007, RF-008, RF-009
- Objetivo: agregar al contrato y a `DatabaseService` una operación transaccional que alterne desde el estado bloqueado y rechace contención.
- Archivos/áreas: `backend/src/domain/services/IDatabaseService.ts`; `backend/src/server-app/services/DatabaseService.ts`; `backend/src/server-app/services/__tests__/DatabaseService.test.ts`.
- Dependencias: T1.
- Hecho cuando:
  - [x] Primero existen tests para `true → false`, `false → true`, inexistencia, transacción, lock `pessimistic_write` con `nowait`, 55P03 y dos invocaciones solapadas.
  - [x] `IDatabaseService` declara `toggleParticipantStatusById` sin exponer TypeORM ni PostgreSQL.
  - [x] Lectura, negación y guardado usan el repositorio del mismo manager transaccional.
  - [x] La inexistencia bajo lock produce `ParticipantNotFoundError` sin guardar.
  - [x] `55P03` produce `ParticipantStatusConflictError`; en el solapamiento simulado solo una invocación guarda.
  - [x] No se modifican schema, migraciones, asistencias ni otros campos del participante.
  - [x] Los tests específicos y la suite backend completa pasan.

## [x] T4 - Crear DisableAndActiveParticipantUseCase

- RF: RF-001, RF-002, RF-003, RF-005, RF-006, RF-007, RF-008, RF-009
- Objetivo: coordinar la operación independiente con el nombre exacto aprobado y devolver únicamente el identificador alternado.
- Archivos/áreas: nuevos `backend/src/domain/use-cases/participant/DisableAndActiveParticipantUseCase.ts` y `backend/src/domain/use-cases/participant/__tests__/DisableAndActiveParticipantUseCase.test.ts`.
- Dependencias: T3.
- Hecho cuando:
  - [x] Los tests se escriben antes de la implementación.
  - [x] La clase se llama exactamente `DisableAndActiveParticipantUseCase`.
  - [x] Recibe únicamente `participantId`, llama una vez a `toggleParticipantStatusById` y devuelve `{ participantId }`.
  - [x] Propaga `ParticipantNotFoundError` y `ParticipantStatusConflictError` sin conocer HTTP.
  - [x] No recibe body, no reutiliza `UpdateParticipantUseCase` y no depende de Express o TypeORM.
  - [x] Los tests específicos y la suite backend completa pasan.

## [x] T5 - Adaptar los controllers de comprobación y alternancia

- RF: RF-003, RF-004, RF-005, RF-006, RF-008, RF-009
- Objetivo: conectar HTTP con ambos casos de uso sin lógica de negocio ni exposición de datos antes de auth.
- Archivos/áreas: `backend/src/server-app/controllers/ParticipantControllers.ts`; `backend/src/server-app/controllers/__tests__/ParticipantControllers.test.ts`.
- Dependencias: T2, T4.
- Hecho cuando:
  - [x] Los tests de controller se escriben antes de los cambios.
  - [x] El handler previo continúa si existe y responde 404 si no existe, sin devolver ni adjuntar datos del participante.
  - [x] El handler previo nunca invoca la alternancia.
  - [x] El controller principal extrae solo `params.id`, ignora `req.body` y entrega únicamente el ID a `DisableAndActiveParticipantUseCase`.
  - [x] El éxito responde exactamente HTTP 200 con `{ participantId }`; inexistencia tardía y conflicto se adaptan a 404 y 409.
  - [x] Los tests específicos y la suite backend completa pasan.

## [x] T6 - Exponer y probar POST /api/participant/toggle-status/:id

- RF: RF-003, RF-004, RF-005, RF-006, RF-008, RF-009
- Objetivo: registrar la ruta con precedencia UUID → existencia → autenticación → autorización → alternancia y verificar el contrato HTTP completo.
- Archivos/áreas: `backend/src/server-app/routes/participant-api.ts`; `backend/src/server-app/routes/__tests__/participant-api.test.ts`.
- Dependencias: T5.
- Hecho cuando:
  - [x] Los tests HTTP se escriben antes de registrar la ruta.
  - [x] La ruta interna `POST /toggle-status/:id` queda publicada como `POST /api/participant/toggle-status/:id`.
  - [x] UUID malformado responde 404 con token válido, sin token y con rol no autorizado, sin consultar existencia, auth ni alternancia.
  - [x] UUID válido inexistente responde 404 con token válido, sin token y con rol no autorizado, sin ejecutar auth ni alternancia.
  - [x] Para participante existente, falta de autenticación responde 401 y `Tutor` responde 403; ningún caso alterna.
  - [x] `Admin`, `Coordinator` y `Equipment` reciben 200 para una operación válida.
  - [x] Body ausente, vacío, arbitrario o con `isActive` no se valida ni llega al caso de uso; solo se entrega el ID.
  - [x] Inexistencia detectada al alternar responde 404, conflicto responde 409 y éxito devuelve exactamente `{ participantId }`.
  - [x] Los tests específicos y la suite backend completa pasan.

## [x] T7 - Sincronizar documentación y memoria operativa

- RF: RF-003, RF-004, RF-005, RF-006, RF-008, RF-009
- Objetivo: documentar el contrato observable, las responsabilidades de los casos de uso y el estado real tras implementar.
- Archivos/áreas: `docs/api.md`; `docs/use-cases.md`; `MEMORY.md`.
- Dependencias: T6.
- Hecho cuando:
  - [x] `docs/api.md` incluye ruta, roles, body ignorado, 200, 409 y precedencia 404 para UUID malformado e inexistente antes de 401/403.
  - [x] `docs/api.md` deja claro que 401/403 corresponden cuando el participante existe y que ninguna modificación ocurre antes de auth.
  - [x] `docs/use-cases.md` documenta `EnsureParticipantExistsUseCase` como consulta sin datos y `DisableAndActiveParticipantUseCase` como única alternancia.
  - [x] `MEMORY.md` refleja únicamente el estado real alcanzado y conserva visible cualquier bloqueo pendiente.
  - [x] La documentación coincide con los tests y la suite backend completa continúa pasando.

## [x] T8 - Validar integralmente la funcionalidad

- RF: RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009
- Objetivo: comprobar la trazabilidad completa y que el cambio se mantuvo dentro del alcance aprobado.
- Archivos/áreas: suite backend, build y revisión del diff completo; sin archivos nuevos previstos.
- Dependencias: T7.
- Hecho cuando:
  - [x] `pnpm --dir backend test` pasa completamente, sin fallos tolerados ni atribuidos a la línea base.
  - [x] `pnpm --dir backend build` pasa.
  - [x] Se registra que backend no dispone de script de lint, sin inventar un comando sustituto.
  - [x] Se verifica que la implementación de la spec 002 no introdujo cambios en frontend, schema, migraciones, dependencias, asistencias ni contratos no relacionados; el working tree conserva cambios preexistentes o del usuario descritos en la nota de atribución.
  - [x] La trazabilidad RF → tests → implementación → documentación está completa.
