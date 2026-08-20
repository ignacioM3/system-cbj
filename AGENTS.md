# AGENTS.md

## Proyecto
Sistema de asistencia para el Centro Barrial de Juventud (CBJ).
Los participantes escanean un QR al llegar a una sede y el sistema
registra su asistencia. Los administradores pueden consultar
registros y generar reportes. Participantes solo pueden marcar una asistencia 
mientras que los administradores todas los participantes que quieran ya que hay muchos
que no tienen celular.

## Stack
- Frontend: React 19 + Vite + TypeScript + TailwindCSS + sileo + react-icons + react-hooks + axios + tanstack/react-query
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: [Sin decisión aún: Prisma / TypeORM / Drizzle]
- Auth: JWT
- Containerization: Docker

## Arquitectura
El proyecto sigue Clean Architecture con separación por capas:

backend/src/
├── domain/          → Entidades, interfaces, reglas de negocio
│   ├── entities/    → Participant, Location, Attendance, User
│   ├── services/    → Interfaces de servicios
│   ├── errors/      → Errores de dominio
│   └── use-cases/   → Lógica de negocio pura
├── server-app/      → Implementación técnica
│   ├── controllers/ → Manejo de HTTP
│   ├── config/      → Configuración de la app e interfaz
│   ├── routes/      → Definición de rutas
│   ├── middleware/   → Auth, validación, authorizaciones
│   ├── database/    → Schemas, migraciones
│   ├── utils/       → Helpers (JWT, HTTP handlers, etc.)
│   └── services/    → Implementaciones concretas

frontend/src/
├── app/             → Configuración de rutas
├── features/        → Módulos por funcionalidad
├── layout/          → Layouts compartidos
├── shared/          → Componentes reutilizables
└── lib/             → Utilidades (axios, etc.)

## Reglas OBLIGATORIAS
1. El dominio (`domain/`) NUNCA importa de Express, HTTP ni base de datos
2. Toda validación de input se hace en la capa de middleware/controller
3. Los errores de negocio se definen en `domain/errors/`
4. NUNCA exponer contraseñas ni secrets en respuestas API
5. Los nombres de entidades en inglés, los mensajes de error en español
6. Preferir funciones puras y tipos estrictos de TypeScript
7. No agregar dependencias sin justificar en DECISIONS.md
8. Antes de crear algo nuevo, revisar si ya existe

## Convenciones de código
- Nombres de archivos: PascalCase para componentes, camelCase para utilities
- Interfaces con prefijo I solo en servicios del dominio
- Usar `satisfies` para type-checking de constantes
- Zod para validación de schemas compartidos

## Idioma
- Código y comentarios técnicos: inglés
- Mensajes de error al usuario: español
- Documentación: español