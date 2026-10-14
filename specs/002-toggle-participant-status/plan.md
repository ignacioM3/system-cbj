# Plan — Alternancia del estado de un participante

**Spec:** `specs/002-toggle-participant-status/spec.md` (aprobada)
**Estado:** aprobado

## Precondición no negociable

La suite backend presenta actualmente 14 fallos relacionados con la línea base de la spec 001. Esos fallos no pertenecen al alcance de esta spec y no se incorporarán a sus tareas.

Antes de ejecutar cualquier tarea de implementación de este plan, incluida la verificación de la T1 parcial conservada, la línea base debe ser restaurada fuera de la spec 002 y `pnpm --dir backend test` debe finalizar completamente en verde. Si la suite sigue fallando, la implementación de esta spec permanece bloqueada y no se continúa.

`ParticipantStatusConflictError` y su test específico ya existen como implementación parcial del plan anterior. Se conservarán, pero no se consideran completos ni se duplicarán hasta verificar, con la línea base verde, que cumplen la spec y que la suite completa continúa pasando.

Nota operativa: aunque `AGENTS.md` documenta `pnpm --filter backend test`, en el workspace actual ese comando devuelve `Scope: 0 of 2 projects` y no ejecuta la suite. Este plan usa el comando efectivo `pnpm --dir backend test`. El script `build` existe en `backend/package.json`, por lo que la validación equivalente será `pnpm --dir backend build`. Esta discrepancia no se corrige en `AGENTS.md` durante la fase PLAN.

## Estrategia

Implementar la alternancia mediante el flujo aprobado:

```text
Route
  → Controller
  → DisableAndActiveParticipantUseCase
  → IDatabaseService
  → DatabaseService
  → PostgreSQL
```

La modificación se resolverá con una operación atómica de persistencia: dentro de una única transacción se obtendrá la fila del participante mediante `FOR UPDATE NOWAIT`, se calculará `!isActive` desde el valor bloqueado y se guardará la transición. La contención PostgreSQL `SQLSTATE 55P03` se convertirá en `ParticipantStatusConflictError` y finalmente en HTTP 409.

Para cumplir la precedencia 404 sin alternar ni exponer datos a usuarios no autenticados, la ruta tendrá una fase previa y exclusivamente consultiva:

```text
Validación UUID (404)
  → Controller de comprobación
  → EnsureParticipantExistsUseCase
  → IDatabaseService.getParticipantById
  → DatabaseService
  → inexistente: 404 / existente: continuar
  → authenticate (401)
  → authorize (403)
  → Controller de alternancia
  → DisableAndActiveParticipantUseCase
  → operación atómica de IDatabaseService
```

`EnsureParticipantExistsUseCase` será un apoyo mínimo exigido por la precedencia aprobada: solo confirma existencia o lanza `ParticipantNotFoundError`; no devuelve el participante al cliente, no modifica estado y no sustituye al caso de uso principal. La segunda consulta dentro de la transacción es intencional: vuelve a comprobar existencia bajo bloqueo y usa el estado vigente después de superar autorización.

El body no tendrá validadores, no será leído por el controller de alternancia y no se transferirá al caso de uso. La entrada funcional será únicamente `participantId`.

La implementación seguirá TDD con Vitest. Cada tarea empezará por los tests del comportamiento que incorpora y no se cerrará mientras fallen sus pruebas específicas o la suite backend completa.

## Áreas afectadas

- Backend / Domain: comprobación de existencia, caso de uso principal y contrato de persistencia.
- Backend / Server App: persistencia transaccional, controllers y route.
- API: precedencia 404, seguridad, respuesta 200 y conflicto 409.
- Tests: dominio, persistencia, controllers y endpoint.
- Documentación: `docs/api.md`, `docs/use-cases.md` y contexto operativo al finalizar.

No se afectan frontend, esquema, migraciones, dependencias ni asistencias históricas.

## Archivos afectados

### Existentes

- `backend/src/domain/errors/ParticipantErrors.ts` — implementación parcial conservada; verificar, no duplicar.
- `backend/src/domain/errors/__tests__/ParticipantErrors.test.ts` — test parcial conservado; verificar.
- `backend/src/domain/services/IDatabaseService.ts`
- `backend/src/server-app/services/DatabaseService.ts`
- `backend/src/server-app/services/__tests__/DatabaseService.test.ts`
- `backend/src/server-app/controllers/ParticipantControllers.ts`
- `backend/src/server-app/controllers/__tests__/ParticipantControllers.test.ts`
- `backend/src/server-app/routes/participant-api.ts`
- `backend/src/server-app/routes/__tests__/participant-api.test.ts`
- `docs/api.md`
- `docs/use-cases.md`
- `MEMORY.md`

### Nuevos

- `backend/src/domain/use-cases/participant/EnsureParticipantExistsUseCase.ts`
- `backend/src/domain/use-cases/participant/__tests__/EnsureParticipantExistsUseCase.test.ts`
- `backend/src/domain/use-cases/participant/DisableAndActiveParticipantUseCase.ts`
- `backend/src/domain/use-cases/participant/__tests__/DisableAndActiveParticipantUseCase.test.ts`

No se crearán archivos de frontend, migraciones ni configuración de dependencias.

## Cambios por capa

### Dominio y aplicación

Conservar y verificar `ParticipantStatusConflictError` como `AppError` 409, sin recrearlo ni cambiarlo si ya satisface el contrato.

Crear `EnsureParticipantExistsUseCase`, dependiente de `IDatabaseService`, para consultar mediante `getParticipantById` y lanzar `ParticipantNotFoundError` cuando corresponda. No conocerá HTTP, autenticación ni Express.

Crear exactamente `DisableAndActiveParticipantUseCase`. Recibirá únicamente `participantId`, invocará una sola operación atómica del contrato `IDatabaseService` y devolverá `{ participantId }`. No recibirá body, no leerá el estado fuera de la operación atómica y no dependerá de TypeORM o PostgreSQL.

Cubre:
- RF-001, RF-002
- RF-003
- RF-005, RF-006
- RF-007, RF-008, RF-009

### Persistencia

Agregar al contrato `IDatabaseService` una operación específica `toggleParticipantStatusById(participantId)` que devuelva el identificador alternado. `DatabaseService` conservará el `DataSource` recibido para abrir la transacción y usará exclusivamente el repositorio obtenido del manager transaccional.

Dentro de la transacción:

1. buscar por `id` con bloqueo `pessimistic_write` y política `nowait` (`FOR UPDATE NOWAIT`);
2. lanzar `ParticipantNotFoundError` si la fila ya no existe;
3. negar el `isActive` leído bajo bloqueo;
4. guardar la misma entidad con el repositorio transaccional;
5. confirmar y devolver `participantId`.

El error de bloqueo `55P03` se traducirá a `ParticipantStatusConflictError`. Los errores de aplicación conocidos se preservarán; otros fallos seguirán el tratamiento general vigente sin exponer detalles de PostgreSQL.

Cubre:
- RF-001, RF-002, RF-003
- RF-007, RF-008, RF-009

### API y seguridad

Agregar `POST /toggle-status/:id` al router montado en `/api/participant` con este orden obligatorio:

1. validar formato UUID y adaptar el fallo a 404;
2. ejecutar la comprobación consultiva de existencia mediante controller y `EnsureParticipantExistsUseCase`;
3. ejecutar `authenticate`;
4. ejecutar `authorize(Admin, Coordinator, Equipment)`;
5. ejecutar el controller de alternancia y `DisableAndActiveParticipantUseCase`.

El controller previo solo continuará o responderá el `ParticipantNotFoundError` 404; no almacenará ni responderá datos del participante. El controller principal extraerá únicamente `req.params.id`, ignorará `req.body` y responderá HTTP 200 con `{ participantId }`. Los `AppError` se adaptarán con la convención existente, incluidos 404 y 409.

Así, UUID malformado o válido inexistente devuelven 404 antes de autenticación. Solo cuando el participante existe, la falta de autenticación produce 401 y un rol no permitido produce 403. Ninguna modificación ocurre antes de superar ambos controles.

Cubre:
- RF-003, RF-004
- RF-005, RF-006
- RF-008, RF-009

### Base de datos e historial

`Participant.isActive` ya existe. No se modifican entidades, schema, índices, relaciones ni migraciones. La operación no consulta ni modifica `Attendance`; el historial permanece intacto.

Cubre:
- RF-007
- RF-008

### Documentación

Actualizar `docs/api.md` con ruta, parámetro, body ignorado, respuesta, roles, precedencia 404 para UUID malformado e inexistente, 401/403 solo para participante existente y 409 por contención. Actualizar `docs/use-cases.md` con ambos casos de uso, dejando claro que solo `DisableAndActiveParticipantUseCase` alterna el estado. Actualizar `MEMORY.md` únicamente al cerrar la implementación, reflejando el estado real sin convertirlo en fuente normativa.

Cubre:
- RF-003, RF-004, RF-005, RF-006, RF-008, RF-009

## Decisiones técnicas

### 1. Comprobación de existencia previa y separada

**Decisión:** usar `EnsureParticipantExistsUseCase` desde un handler de controller anterior a autenticación.

**Motivo:** la spec exige comprobar existencia antes de 401/403, mientras que el acceso directo a datos desde route/controller rompería la separación por capas. El caso de uso consultivo no alterna ni devuelve datos.

**Alternativa descartada:** consultar `DatabaseService` directamente desde route o controller.

**Motivo del descarte:** omite la capa de aplicación y asigna acceso a datos a una capa HTTP.

**Alternativa descartada:** ejecutar el caso de uso de alternancia antes de autenticación.

**Motivo del descarte:** permitiría una modificación no autorizada y violaría la Constitución.

### 2. Reconsulta dentro de la transacción

**Decisión:** no reutilizar la entidad obtenida por la comprobación previa; volver a buscarla bajo bloqueo después de autorización.

**Motivo:** la consulta previa solo decide precedencia HTTP. El estado usado para alternar debe ser el vigente y quedar protegido durante lectura y escritura.

**Alternativa descartada:** pasar la entidad consultada antes de auth al controller o caso de uso principal.

**Motivo del descarte:** prolonga datos a través de la frontera de seguridad y deja una ventana de carrera.

### 3. Bloqueo no bloqueante

**Decisión:** transacción con `FOR UPDATE NOWAIT`; traducir `55P03` a 409.

**Motivo:** una solicitud obtiene el derecho a alternar y las solicitudes solapadas fallan inmediatamente sin ejecutar una segunda transición.

**Alternativa descartada:** esperar el bloqueo o ejecutar `isActive = NOT isActive` sin rechazo.

**Motivo del descarte:** permitiría que todas las solicitudes concurrentes acabaran alternando, contrario a RF-008.

### 4. Body ignorado por construcción

**Decisión:** no declarar validadores de body y construir la entrada exclusivamente con `id`.

**Motivo:** garantiza que ninguna propiedad, incluido `isActive`, determine la transición.

**Alternativa descartada:** filtrar o rechazar propiedades del body.

**Motivo del descarte:** la spec exige ignorarlas, no validarlas ni rechazarlas.

## Estrategia de tests

Todos los tests usarán Vitest.

### Línea base y error conservado

- Antes de cualquier tarea, comprobar que la suite backend completa está verde después del saneamiento externo de la spec 001.
- Verificar el test específico existente de `ParticipantStatusConflictError` y que mantiene `AppError`, código estable y status 409.
- No declarar T1 completa basándose solo en su test aislado.

### Casos de uso

- `EnsureParticipantExistsUseCase`: continúa para participante existente y lanza `ParticipantNotFoundError` para inexistente, sin modificar datos.
- `DisableAndActiveParticipantUseCase`: entrega solo el ID a la operación atómica, devuelve `{ participantId }` y propaga inexistencia y conflicto.

### Persistencia

- Transición `true → false` y `false → true` usando el repositorio del manager transaccional.
- Ausencia bajo bloqueo produce `ParticipantNotFoundError` sin guardar.
- Se configuran `pessimistic_write` y `nowait`.
- `55P03` produce `ParticipantStatusConflictError` sin guardado adicional.
- Dos invocaciones solapadas simuladas determinísticamente: una guarda una transición y la otra recibe conflicto.

No existe actualmente infraestructura de integración PostgreSQL para estos tests. Por ello se verifican la transacción, las opciones de lock y la traducción del código mediante dobles; no se afirmará una prueba real de bloqueo contra PostgreSQL.

### Controllers

- La comprobación previa continúa sin enviar datos cuando existe y responde 404 cuando no existe.
- El controller principal toma solo `params.id`, no pasa `req.body` y responde exactamente `200 { participantId }`.
- Inexistencia posterior a la comprobación y conflicto se adaptan a 404 y 409.

### API

- UUID malformado devuelve 404 con token válido, sin token y con rol no autorizado; no consulta existencia, auth ni alternancia.
- UUID válido inexistente devuelve 404 con token válido, sin token y con rol no autorizado; no ejecuta auth ni alternancia.
- Participante existente sin autenticación devuelve 401 después de comprobar existencia.
- Participante existente con `Tutor` devuelve 403 y no alterna.
- `Admin`, `Coordinator` y `Equipment` obtienen 200 en una operación válida.
- Body ausente, vacío, arbitrario y con `isActive` produce la misma entrada: solo el ID.
- Conflicto del caso de uso produce 409; inexistencia detectada de nuevo al alternar produce 404.
- La respuesta exitosa contiene exactamente `{ participantId }`.

### Validación final

- `pnpm --dir backend test` completamente verde.
- `pnpm --dir backend build` verde.
- El paquete backend no define actualmente script de lint; no se inventará uno.
- Revisión del diff para confirmar ausencia de frontend, migraciones, schema, dependencias y cambios no relacionados.

## Riesgos y mitigaciones

- **Enumeración de participantes:** la precedencia 404 permite inferir existencia comparando 404 con 401/403. Es un riesgo aprobado explícitamente. Mitigación: no devolver datos, ejecutar una consulta mínima y mantener auth antes de cualquier modificación.
- **Carrera entre comprobación y modificación:** el participante podría cambiar o desaparecer después del precheck. Mitigación: reconsulta obligatoria bajo lock dentro de la transacción.
- **Uso accidental del repositorio global:** invalidaría la unidad transaccional. Mitigación: tests que exigen repositorio del manager para buscar y guardar.
- **Espera y segunda transición:** omitir `NOWAIT` permitiría alternancias sucesivas. Mitigación: verificar opciones de lock y traducción 55P03.
- **Body filtrado al dominio:** podría fijar `isActive`. Mitigación: input construido solo con `id` y tests con bodies contradictorios.
- **Cobertura de concurrencia con dobles:** no demuestra el comportamiento de PostgreSQL real. Mitigación: documentar la limitación y verificar de forma determinista configuración y traducción, sin agregar infraestructura o dependencias fuera de alcance.
- **Línea base roja:** impide distinguir regresiones. Mitigación: bloqueo absoluto de todas las tareas hasta que la suite se sanee fuera de esta spec.

## Trazabilidad resumida

| Requisito | Plan |
|---|---|
| RF-001 / RF-002 | Caso de uso principal y alternancia transaccional |
| RF-003 | UUID 404, comprobación previa y reconsulta bajo lock |
| RF-004 | Existencia antes de `authenticate`/`authorize`; seguridad antes de modificar |
| RF-005 / RF-006 | Ruta, controller y `{ participantId }` |
| RF-007 | Solo cambia `Participant.isActive`; no toca historial |
| RF-008 | `FOR UPDATE NOWAIT`, 55P03 → 409 y tests de solapamiento |
| RF-009 | Sin validadores ni transferencia del body |
