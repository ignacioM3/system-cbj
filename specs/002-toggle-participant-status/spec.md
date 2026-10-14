# Alternancia del estado de un participante

**Estado:** aprobada

## Objetivo

Permitir que un usuario autorizado alterne el estado de actividad de un participante sin eliminarlo: un participante activo pasa a inactivo y uno inactivo vuelve a estar activo.

La petición original solicitaba «desabilitar el participante» desde la API de participantes. Durante la clarificación, el usuario amplió explícitamente el comportamiento a una alternancia de estado; esta decisión posterior tiene prioridad.

## Requisitos relacionados

- `RF-021 — Activar participante` de `docs/requirements.md`.
- `RF-022 — Desactivar participante` de `docs/requirements.md`.
- `RF-034 — Preservación del historial` de `docs/requirements.md`.
- `RF-036 — Entidades activas e inactivas` de `docs/requirements.md`.
- `RF-037 — Protección de endpoints` de `docs/requirements.md`.
- `RF-038 — Autorización en backend` de `docs/requirements.md`.

## Alcance

- Alternar el estado `isActive` de un participante existente.
- Cambiar un participante activo a inactivo.
- Cambiar un participante inactivo a activo.
- Exponer la operación mediante la ruta interna `POST /toggle-status/:id` del router de participantes, publicada como `POST /api/participant/toggle-status/:id`.
- Requerir autenticación y autorización en backend para los roles `Admin`, `Coordinator` y `Equipment`.
- Ignorar por completo cualquier body recibido; la alternancia depende exclusivamente del estado persistido del participante identificado por `id`.
- Conservar el participante y su información histórica asociada.
- Contemplar las capas mínimas necesarias para completar la operación según el flujo `Route → Controller → Use Case → Service/Repository`, aunque la petición original mencionara solamente `participant-api`.
- Sincronizar `docs/api.md` con el nuevo contrato observable y `docs/use-cases.md` con la operación y su regla de concurrencia cuando se implemente la funcionalidad.

## Fuera de alcance

- Eliminación física de participantes.
- Edición de datos personales o de la sede del participante.
- Modificación o eliminación de asistencias históricas.
- Cambios en la estructura persistida de `Participant`.
- Interfaz de usuario o integración desde el frontend.
- Activación o desactivación masiva de participantes.
- Migraciones o cualquier cambio de esquema de base de datos.
- Incorporación o actualización de dependencias.

## Requisitos funcionales

### RF-001 — Desactivar participante activo

**Cuando** un usuario autenticado y autorizado solicite alternar el estado de un participante existente que se encuentre activo,
**el sistema debe** cambiar su estado a inactivo y conservar el registro del participante.

### RF-002 — Activar participante inactivo

**Cuando** un usuario autenticado y autorizado solicite alternar el estado de un participante existente que se encuentre inactivo,
**el sistema debe** cambiar su estado a activo y conservar el registro del participante.

### RF-003 — Identificador inválido o participante inexistente

**Si** el parámetro `id` no tiene un formato UUID válido,
**el sistema debe** rechazar la operación con HTTP 404 y no modificar datos, incluso cuando la solicitud no esté autenticada o el usuario no tenga un rol autorizado.

**Si** el parámetro `id` tiene un formato UUID válido pero no corresponde a un participante existente,
**el sistema debe** rechazar la operación mediante `ParticipantNotFoundError` con HTTP 404 y no modificar datos, incluso cuando la solicitud no esté autenticada o el usuario no tenga un rol autorizado.

### RF-004 — Autenticación y autorización

**Mientras** el parámetro `id` identifique a un participante existente y el usuario no esté autenticado,
**el sistema debe** rechazar la operación con HTTP 401 y no modificar el estado del participante.

**Mientras** el parámetro `id` identifique a un participante existente y el usuario autenticado no posea uno de los roles `Admin`, `Coordinator` o `Equipment`,
**el sistema debe** rechazar la operación con HTTP 403 y no modificar el estado del participante.

La validación del formato UUID y la comprobación de existencia del participante tienen precedencia sobre estos controles a efectos de la respuesta: un `id` malformado o un UUID válido inexistente producen HTTP 404 aunque también falte autenticación o autorización. Los HTTP 401 y 403 solo corresponden cuando el participante existe.

### RF-005 — Contrato de la operación

**Cuando** se solicite una alternancia válida mediante la ruta interna `POST /toggle-status/:id`, publicada como `POST /api/participant/toggle-status/:id`,
**el sistema debe** identificar al participante mediante el parámetro `id` y ejecutar una única alternancia de su estado.

### RF-006 — Respuesta exitosa

**Cuando** el estado se haya alternado correctamente,
**el sistema debe** responder con HTTP 200 y el cuerpo JSON `{ "participantId": "<id>" }`, donde `<id>` es el identificador del participante actualizado.

### RF-007 — Preservación del historial

**Cuando** se alterne el estado de un participante,
**el sistema debe** conservar sin eliminación automática sus registros de asistencia y demás información histórica asociada.

### RF-008 — Alternancias concurrentes

**Si** dos o más solicitudes intentan alternar concurrentemente el estado del mismo participante,
**el sistema debe** aplicar una sola alternancia y rechazar las demás solicitudes concurrentes con HTTP 409, sin realizar transiciones adicionales.

### RF-009 — Body irrelevante para la alternancia

**Cuando** una solicitud incluya un body vacío o con cualquier propiedad, incluido `isActive`,
**el sistema debe** ignorar por completo su contenido y calcular la transición exclusivamente a partir del estado persistido del participante.

**Cuando** una solicitud no incluya body,
**el sistema debe** procesarla bajo las mismas reglas que una solicitud con body, sin exigir datos adicionales.

## Casos límite

- Participante activo: pasa a inactivo y la operación responde HTTP 200 con su identificador.
- Participante inactivo: pasa a activo y la operación responde HTTP 200 con su identificador.
- Identificador con formato UUID inválido: HTTP 404, sin cambios.
- Identificador con formato UUID inválido en una solicitud no autenticada o realizada por un rol no autorizado: prevalece HTTP 404 sobre HTTP 401/403, sin cambios.
- UUID válido que no corresponde a un participante: HTTP 404 mediante `ParticipantNotFoundError`, sin cambios.
- UUID válido que no corresponde a un participante en una solicitud no autenticada o realizada por un rol no autorizado: prevalece HTTP 404 sobre HTTP 401/403, sin cambios.
- Usuario no autenticado y participante existente: HTTP 401, sin cambios.
- Usuario autenticado con un rol distinto de `Admin`, `Coordinator` o `Equipment` y participante existente: HTTP 403, sin cambios.
- Solicitudes sucesivas sobre el mismo participante alternan el estado una vez por cada operación exitosa; no se tratan como una desactivación idempotente.
- Dos o más solicitudes concurrentes sobre el mismo participante: solo una aplica la alternancia; las demás reciben HTTP 409 y no producen cambios adicionales.
- Body ausente, vacío o con propiedades: se ignora y no cambia el resultado de la operación.
- Body con `isActive`: su valor no determina el estado final; la transición se calcula desde el estado persistido.
- La alternancia no elimina ni modifica las asistencias históricas del participante.

## Criterios de aceptación

- [ ] La ruta interna `POST /toggle-status/:id` está disponible públicamente como `POST /api/participant/toggle-status/:id`.
- [ ] Un participante activo queda inactivo después de una solicitud válida.
- [ ] Un participante inactivo queda activo después de una solicitud válida.
- [ ] Cada solicitud exitosa realiza exactamente una alternancia de estado.
- [ ] Ante dos o más alternancias concurrentes sobre el mismo participante, solo una se aplica y las restantes reciben HTTP 409 sin transiciones adicionales.
- [ ] La respuesta exitosa es HTTP 200 con `{ "participantId": "<id>" }`.
- [ ] Un `id` con formato UUID inválido produce HTTP 404 sin modificar datos.
- [ ] Un `id` con formato UUID inválido produce HTTP 404 aun cuando la misma solicitud no esté autenticada o pertenezca a un rol no autorizado.
- [ ] Un UUID válido que no corresponde a un participante produce `ParticipantNotFoundError` y HTTP 404 sin modificar datos, aun cuando la misma solicitud no esté autenticada o pertenezca a un rol no autorizado.
- [ ] La operación requiere autenticación en backend.
- [ ] Los roles `Admin`, `Coordinator` y `Equipment` están autorizados.
- [ ] Cuando el participante existe, un usuario no autenticado recibe HTTP 401 y el estado no cambia.
- [ ] Cuando el participante existe, un usuario autenticado con un rol no autorizado recibe HTTP 403 y el estado no cambia.
- [ ] La operación admite un body ausente o vacío sin exigir campos adicionales.
- [ ] Cualquier propiedad recibida en el body se ignora por completo.
- [ ] Enviar `isActive: true` o `isActive: false` no fija el estado solicitado ni altera la regla de alternancia; el nuevo estado se calcula exclusivamente desde el valor persistido.
- [ ] La operación no elimina físicamente al participante ni altera sus registros históricos de asistencia.
- [ ] `docs/api.md` documenta la ruta pública, autenticación, autorización, parámetro UUID, precedencia 404 tanto para UUID malformado como para UUID válido inexistente, body ignorado, respuesta 200 y errores 401, 403, 404 y 409 definidos por esta spec.
- [ ] `docs/use-cases.md` documenta la alternancia de estado y el rechazo con 409 de las solicitudes concurrentes que no se aplican.
- [ ] El comportamiento queda cubierto por pruebas verificables de la lógica de aplicación y del contrato HTTP.

## Reglas de negocio

- El estado del participante se representa mediante `isActive`.
- La operación es una alternancia: `true` pasa a `false` y `false` pasa a `true`.
- Cada ejecución exitosa cambia el estado exactamente una vez.
- Las alternancias concurrentes sobre un mismo participante no pueden producir más de una transición: una solicitud se aplica y las demás se rechazan con HTTP 409.
- Solamente `Admin`, `Coordinator` y `Equipment` pueden ejecutar la operación.
- La autorización debe aplicarse en backend.
- La validación del formato UUID de `id` y la comprobación de existencia del participante preceden a la respuesta de autenticación/autorización: un `id` malformado o un UUID válido inexistente producen 404 antes que 401/403.
- El body no forma parte de la entrada funcional de la operación y debe ignorarse por completo, incluido cualquier valor de `isActive`.
- El único estado utilizado para calcular la transición es el estado persistido del participante.
- La alternancia de estado es lógica y no equivale a eliminar el participante.
- La información histórica asociada al participante debe preservarse.
- La edición general de participantes no administra `isActive`; esta operación permanece separada, conforme a `specs/001-edit-participant/spec.md`.

## Restricciones

- La operación debe estar representada por un caso de uso independiente llamado exactamente `DisableAndActiveParticipantUseCase`.
- Respetar el flujo `Route → Controller → DisableAndActiveParticipantUseCase → IDatabaseService → DatabaseService`.
- La ruta y el controller no deben contener la regla de alternancia de estado.
- El caso de uso no debe depender de HTTP, Express ni detalles de persistencia.
- El acceso a datos debe realizarse mediante las abstracciones de persistencia existentes.
- No reutilizar automáticamente `UpdateParticipantUseCase`: la edición general excluye explícitamente `isActive` y esta es una operación independiente.
- La alternancia debe ejecutarse atómicamente dentro de una transacción, con bloqueo PostgreSQL `FOR UPDATE NOWAIT` sobre el participante.
- La contención PostgreSQL identificada por `SQLSTATE 55P03` debe traducirse al HTTP 409 definido en RF-008.
- La validación del formato UUID y la comprobación de existencia del participante deben ejecutarse antes de autenticación y autorización para preservar la precedencia HTTP 404 definida en RF-003 y RF-004.
- El body no debe transferirse a `DisableAndActiveParticipantUseCase`; su única entrada funcional es el identificador del participante.
- No modificar contratos existentes de creación, consulta, listado o edición de participantes.
- No realizar cambios de esquema, migraciones ni cambios destructivos para cumplir esta funcionalidad.
- No modificar el frontend ni agregar o actualizar dependencias.

## Contrato de API definido

```text
Ruta interna del router de participantes:
POST /toggle-status/:id

Ruta pública completa:
POST /api/participant/toggle-status/:id

Autenticación:
- Requerida.

Autorización:
- Admin
- Coordinator
- Equipment

Parámetro de ruta:
- id: identificador UUID del participante.

Request body:
- No es requerido.
- Si se recibe, se ignora por completo.
- Ninguna propiedad, incluido isActive, determina la transición.

Respuesta exitosa:
- HTTP 200
- JSON: { "participantId": "<id>" }

Identificador inválido:
- HTTP 404 cuando id no tiene formato UUID válido.
- HTTP 404 prevalece sobre HTTP 401/403 si también falta autenticación o autorización.

Participante inexistente:
- HTTP 404 mediante ParticipantNotFoundError cuando id es un UUID válido que no corresponde a un participante.
- HTTP 404 prevalece sobre HTTP 401/403 si también falta autenticación o autorización.

Conflicto de concurrencia:
- HTTP 409 para cada solicitud concurrente que no obtenga el derecho a aplicar la única alternancia.
- Las solicitudes rechazadas no realizan transiciones adicionales.

Errores de acceso:
- HTTP 401 para una solicitud no autenticada cuando el participante existe.
- HTTP 403 para un usuario autenticado sin un rol autorizado cuando el participante existe.
```

La forma concreta del cuerpo de error no queda definida por esta spec y deberá conservar la convención vigente del sistema.

## Consideración de seguridad aceptada

- Comprobar la existencia antes de autenticación y autorización permite distinguir un participante inexistente (404) de uno existente (401/403) mediante solicitudes sin acceso autorizado. Esto expone la existencia del identificador como información observable. El riesgo se acepta por decisión explícita del usuario; la respuesta 404 no debe incluir datos del participante y la operación seguirá exigiendo autenticación y autorización antes de modificar su estado.

## Impacto

- **Dominio y aplicación:** caso de uso independiente `DisableAndActiveParticipantUseCase` para alternar el estado y verificar la existencia del participante.
- **API backend:** ruta protegida, body irrelevante y adaptación de la solicitud y la respuesta definidas por el contrato.
- **Documentación:** actualización de `docs/api.md` para registrar el nuevo contrato observable y de `docs/use-cases.md` para registrar la operación y su regla de concurrencia durante la implementación.
- **Persistencia:** alternancia atómica dentro de una transacción con `FOR UPDATE NOWAIT`, traduciendo la contención `55P03` al conflicto HTTP 409, sin eliminación física, migración ni cambio de esquema.
- **Concurrencia:** garantía de una sola transición cuando coincidan solicitudes sobre el mismo participante; las restantes se rechazan con HTTP 409.
- **Seguridad:** autenticación y autorización en backend para los tres roles aprobados, después de comprobar formato y existencia; se acepta explícitamente la exposición de existencia derivada de la precedencia 404.
- **Historial:** preservación de las asistencias y relaciones históricas existentes.
- **Frontend:** sin cambios dentro del alcance de esta spec.
- **Dependencias:** sin incorporaciones ni actualizaciones.
- **Tests:** cobertura del cambio en ambos sentidos, participante inexistente, permisos, concurrencia, body ignorado y contrato HTTP.

## Decisiones tomadas

1. La operación final es una alternancia de estado, no solamente una desactivación.
2. La ruta interna definida es `POST /toggle-status/:id` dentro del router de participantes y su ruta pública completa es `POST /api/participant/toggle-status/:id`.
3. Un participante activo pasa a inactivo y uno inactivo pasa a activo.
4. Los roles autorizados son `Admin`, `Coordinator` y `Equipment`.
5. Un participante inexistente produce HTTP 404 mediante `ParticipantNotFoundError`.
6. Una operación exitosa produce HTTP 200 con `{ "participantId": "<id>" }`.
7. La operación debe atravesar las capas mínimas requeridas por la arquitectura y no limitarse a declarar una ruta aislada.
8. Cuando el participante existe, una solicitud no autenticada recibe HTTP 401 y un usuario autenticado sin un rol autorizado recibe HTTP 403; si no existe, prevalece HTTP 404.
9. `docs/api.md` debe sincronizarse con el contrato observable y `docs/use-cases.md` con la operación y su regla de concurrencia cuando se implemente la funcionalidad.
10. Ante alternancias concurrentes sobre el mismo participante, solo una se aplica y las demás se rechazan con HTTP 409, sin cambios adicionales.
11. Un `id` con formato UUID inválido produce HTTP 404, al igual que un UUID válido que no corresponde a un participante; para este último caso se utiliza `ParticipantNotFoundError`.
12. Cuando coinciden un `id` malformado y falta de autenticación o autorización, prevalece HTTP 404 por identificador inválido sobre HTTP 401/403.
13. El body no es requerido y cualquier contenido recibido se ignora por completo, incluido `isActive`; la transición se calcula exclusivamente desde el estado persistido.
14. La operación tendrá un caso de uso independiente llamado exactamente `DisableAndActiveParticipantUseCase` y seguirá el flujo `Route → Controller → DisableAndActiveParticipantUseCase → IDatabaseService → DatabaseService`.
15. La alternancia será atómica dentro de una transacción y utilizará bloqueo PostgreSQL `FOR UPDATE NOWAIT`; la contención `SQLSTATE 55P03` se traducirá a HTTP 409.
16. La validación UUID y la comprobación de existencia se ejecutarán antes de autenticación y autorización: tanto un UUID malformado como uno válido inexistente producirán HTTP 404 antes que 401/403.
17. El body no se transferirá al caso de uso.
18. La funcionalidad no incorporará frontend, migraciones, cambios de esquema ni dependencias nuevas o actualizadas.
19. Se acepta el riesgo de que esta precedencia permita inferir si un UUID corresponde a un participante existente; la respuesta no expondrá datos del participante y ninguna alternancia ocurrirá sin autenticación y autorización.

## Decisiones pendientes

- Ninguna decisión funcional bloqueante identificada para aprobar esta spec.
