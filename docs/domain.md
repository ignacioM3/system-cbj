# Dominio del Sistema de Asistencia CBJ

## Entidades

### Participant (Participante)
Persona que asiste a las actividades del CBJ.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| firstName | string | Nombre |
| lastName | string | Apellido |
| documentNumber | string | DNI |
| birthDate | Date? | Fecha de nacimiento (opcional) |
| phone | string? | Teléfono de contacto (opcional) |
| email | string? | Email de contacto (opcional) |
| isActive | boolean | Si sigue participando |
| createdAt | Date | Fecha de registro |

**Reglas de negocio:**
- El nombre + apellido debe ser suficiente para identificarlo en la UI
- Un participante inactivo no puede registrar asistencia

### Location (Sede)
Lugar físico donde se realizan actividades.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | string | Nombre de la sede |
| address | string | Dirección |
| isActive | boolean | Si la sede está operativa |

**Reglas de negocio:**
- Cada sede tiene un ID unico donde a base de ese crearemos mas adelante el QR

### Attendance (Asistencia)
Registro de la presencia de un participante en una sede.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| participantId | UUID | FK al participante |
| locationId | UUID | FK a la sede |
| date | Date | Fecha de la asistencia |
| time | string | Hora de llegada |
| registeredBy | UUID? | Admin que registró (si fue manual) |

**Reglas de negocio:**
- Un participante NO puede registrar asistencia dos veces
  el mismo día en la misma sede
- La asistencia es inmutable (no se edita, se puede anular)
- Se registra automáticamente la fecha y hora

### User (Usuario del sistema)
Persona que administra el sistema.
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| firstName | string | Nombre |
| lastName | string | Apellido |
| documentNumber | string | DNI |
| birthDate | Date? | Fecha de nacimiento (opcional) |
| email | string? | Email (único)(opcional) |
| password | string | Hash de contraseña |
| phone | string? | Teléfono de contacto (opcional) |
| isActive | boolean | Si sigue activo |
| role | enum | ADMIN, COORDINATOR, EQUIPMENT, TUTOR, PARTICIPANT |

**Reglas de negocio:**
- Solo ADMIN puede crear/editar participantes y sedes
- COORDINATOR puede visualizar unicamente información de la sede donde es coordinador
- EQUIPMENT son equipos de cada sede pueden registrar asistencias y mas adelante tendran otras funciones en el sistema
- TUTOR son la parte mas baja del sistema tendran muy pocos permisos dentro del sistema
- PARTICIPANT participantes del sistema no requiren que tengan por ahora contraseña solo funciona para poder tener registro de la asistencia.