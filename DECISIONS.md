# Architecture Decision Records

## ADR-001 — Aplicación web (no nativa)
**Estado:** Aceptada
**Fecha:** 2026-08-15

**Contexto:** Necesitamos que los chicos registren asistencia desde sus celulares.
**Decisión:** Aplicación web responsive en vez de app nativa.
**Razón:**
- No requiere instalación
- Funciona en cualquier celular con navegador
- Actualizaciones centralizadas (no dependen de Play Store)
- Menor costo de desarrollo
**Consecuencias:** Necesita conexión a internet. Si la sede no tiene wifi,
se deberá resolver con datos móviles o conectividad local.

## ADR-002 — Un QR por sede
**Estado:** Aceptada
**Fecha:** 2026-08-15

**Contexto:** ¿QR por participante o QR por sede?
**Decisión:** QR por sede.
**Razón:**
- Más simple de implementar
- No requiere credenciales individuales para el QR
- Fácil de reemplazar si se daña
**Consecuencias:** El QR identifica la SEDE, no al participante.
El participante se identifica después de escanear (con su nombre/DNI/usuario).

## ADR-003 — PostgreSQL como base de datos
**Estado:** Aceptada
**Fecha:** 2026-08-15

**Contexto:** Necesitamos una BD relacional para datos estructurados.
**Decisión:** PostgreSQL en vez de SQLite.
**Razón:**
- Soporte concurrente (varios chicos escaneando al mismo tiempo)
- Escala si se agregan más sedes/funcionalidades
- Docker lo hace fácil de configurar
**Consecuencias:** Requiere más configuración que SQLite.

## ADR-004 — JWT para autenticación
**Estado:** Aceptada
**Decisión:** Tokens JWT para sesiones de administradores.
**Razón:** Stateless, fácil de implementar con Express.
**Nota:** Los participantes NO necesitan login para marcar asistencia.
Solo los administradores se autentican.
