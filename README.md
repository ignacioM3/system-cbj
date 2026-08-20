# Sistema de Asistencia CBJ

Sistema de gestión de asistencia para participantes del Centro Barrial de Juventud (CBJ).

## Problema que resuelve
Actualmente los chicos llegan y se anotan en una hoja cuando llegan.
Esto genera:
- Pérdida de registros
- Imposibilidad de generar estadísticas
- Dificultad para hacer seguimiento de asistencia
- Sintema propio para los centros

## Solución
Cada sede tiene un código QR. El participante lo escanea al llegar
y el sistema registra su asistencia automáticamente.

## Stack Tecnológico
- **Frontend:** React + Vite + TypeScript + TailwindCSS + sileo + react-icons + react-hooks + axios + tanstack/react-query
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** PostgreSQL
- **ORM:** Prisma (o TypeORM, lo que decidas)
- **Containerización:** Docker

## Cómo ejecutar el proyecto

### Requisitos previos
- Node.js 22+
- pnpm
- Docker y Docker Compose

### Instalación
1. Clonar el repositorio
2. `cp backend/.env.example backend/.env` y completar variables
3. `docker compose up --build`

### Variables de entorno
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del backend | 3000 |
| DATABASE_URL | Conexión PostgreSQL | postgresql://user:pass@localhost:5432/cbj |
| JWT_SECRET | Secreto para tokens | mi-secreto-super-seguro |
| FRONTEND_URL | URL del frontend | http://localhost:5173 |

## Estructura del proyecto
Ver [docs/architecture.md](docs/architecture.md)