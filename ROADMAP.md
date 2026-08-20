# Roadmap

# Phase 1 — Foundation (Semana 1-2)
- [x] Project setup (monorepo, Docker, TypeScript)
- [ ] Configurar PostgreSQL con Docker
- [ ] Configurar ORM y migraciones
- [ ] Entidades del dominio: Participant, Location, Attendance, User
- [ ] Sistema de autenticación (login, JWT, middleware)
- [ ] CRUD básico de User

## Phase 2 — Core Attendance (Semana 3-4)
- [ ] CRUD de Participant
- [ ] CRUD de Location + generación de QR
- [ ] Endpoint público de registro de asistencia
- [ ] Página de escaneo QR (frontend)
- [ ] Validación de asistencia duplicada

## Phase 3 — Dashboard (Semana 5-6)
- [ ] Dashboard de admin: asistencia del día
- [ ] Filtros por sede y fecha
- [ ] Historial por participante
- [ ] Gestión de participantes (UI)
- [ ] Gestión de sedes (UI) + descarga de QR

## Phase 4 — Polish & Deploy (Semana 7-8)
- [ ] Responsive mobile para página de QR
- [ ] Manejo de errores y estados de carga
- [ ] Tests de endpoints críticos
- [ ] Deploy a producción
- [ ] Documentación para coordinadores