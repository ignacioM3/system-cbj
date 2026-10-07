# AGENTS.md

Reglas generales para agentes de IA que trabajan en este repositorio.
Antes de modificar código, entender la arquitectura y consultar la documentación.

---

## 1. Proyecto

Aplicación web para gestionar la asistencia de participantes y talleristas en
diferentes sedes. Reemplaza el registro en papel por un sistema digital.

Módulos principales: usuarios, participantes, sedes, asistencias,
autenticación, autorización y roles.

---

## 2. Stack

- **Backend:** Node.js, TypeScript, Express, TypeORM, PostgreSQL.
- **Frontend:** React, TypeScript, Vite.
- **Tests:** Vitest.
- **Monorepo:** `backend/` y `frontend/` son aplicaciones separadas en el
  mismo repositorio. La documentación técnica vive en `docs/`.

---

## 3. Comandos

- Instalar dependencias: `pnpm install`
- Backend en desarrollo: `pnpm --filter backend dev`
- Frontend en desarrollo: `pnpm --filter frontend dev`
- Tests: `pnpm --filter backend test` / `pnpm --filter frontend test`
- Lint: `pnpm lint`
- Build: `pnpm build`

Si un comando no existe todavía, no lo inventes: decilo explícitamente.

---

## 4. Flujo de trabajo (SDD — Spec-Driven Development)

Los cambios no triviales siguen el flujo definido en `.opencode/commands/sdd-*.md`:

1. `docs/constitution.md` define principios innegociables. **Tiene prioridad
   sobre cualquier otra regla de este archivo.**
2. Cada funcionalidad vive en `specs/<NNN-nombre>/` con tres archivos:
   `spec.md` (el qué y el por qué, en EARS), `plan.md` (el cómo técnico) y
   `tasks.md` (tareas pequeñas y verificables).
3. **Ninguna implementación empieza sin una spec aprobada.** No toques
   código en fases de spec, clarificación, planificación o tasks.
4. `sdd-implement` implementa **una** tarea: tests primero, se detiene al
   terminar. No continúa con la siguiente sin autorización.
5. `sdd-validate` verifica RF por RF. Si algo no está cubierto o falla, se
   reporta; no se arregla silenciosamente.
6. `sdd-status` es de solo lectura.

`MEMORY.md` contiene el contexto vivo del proyecto. Consultalo antes de
trabajar y actualizalo al cerrar cambios significativos.

---

## 5. Arquitectura (no negociable)

**Backend** separa estrictamente:

- `domain/` → reglas y conceptos del negocio (entidades, errores, casos de uso).
- `server-app/` → infraestructura y comunicación (controllers, rutas,
  middleware, base de datos, servicios).

Reglas:
- No meter lógica de negocio en controllers.
- No hacer que los casos de uso dependan de Express.
- No acceder a la base de datos fuera de las abstracciones existentes.
- No duplicar lógica que ya vive en otro caso de uso o servicio.

**Frontend** respeta la organización de `src/` (`api/`, `app/`, `context/`,
`features/`, `layout/`, `lib/`, `shared/`, `types/`). Antes de crear un
componente o utilidad, buscar si ya existe uno reutilizable.

No introducir arquitecturas, patrones o dependencias nuevas sin justificarlo
y sin registrar la decisión.

---

## 6. Seguridad, base de datos y API

- **Auth:** nunca eliminar ni evitar un chequeo de autorización para hacer
  funcionar una funcionalidad. Los roles y middleware existentes se respetan.
- **DB:** antes de modificar entidades o esquema, revisar entidades, relaciones
  y `docs/database.md`. Usar el mecanismo de migraciones del proyecto. No
  hacer cambios destructivos sin razón explícita.
- **API:** respetar el flujo `Route → Controller → Use Case → Service /
  Repository`. Ver `docs/api.md` para el contrato exacto.

---

## 7. Modificar código

Antes de tocar código:

1. Entender el problema.
2. Revisar la implementación existente relacionada.
3. Revisar la documentación correspondiente en `docs/`.
4. Identificar el impacto.
5. Seguir los patrones existentes.
6. Hacer el cambio **más pequeño** que resuelva el problema.
7. Validar.

No modificar código no relacionado con la tarea.

---

## 8. Validación

Una tarea no termina porque se escribió código. Según el caso, verificar:

- TypeScript compila.
- Tests pasan.
- Lint pasa.
- Build pasa.
- Comportamiento real (backend y frontend).
- Integración frontend ↔ backend.

Si una validación no puede ejecutarse, decirlo explícitamente.

---

## 9. Documentación

Si un cambio afecta arquitectura, dominio, base de datos, contrato de API o
comportamiento observable, actualizar el documento correspondiente en `docs/`:

- `docs/architecture.md` → arquitectura y organización del código.
- `docs/domain.md` → entidades y conceptos del dominio.
- `docs/database.md` → esquema, relaciones, migraciones.
- `docs/api.md` → contrato de endpoints.
- `docs/use-cases.md` → casos de uso.
- `docs/requirements.md` → requisitos.

---

## 10. Regla principal

> **Entender primero, modificar después.**

## 11. Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.