# Requisitos del Sistema

## Requisitos Funcionales

### RF-01: Registro de asistencia por QR
- El participante escanea el QR de la sede
- El sistema abre una página web identificando la sede
- El participante ingresa su nombre (o selecciona de una lista)
- El sistema registra la asistencia con fecha y hora
- Se muestra confirmación visual

### RF-02: Registro de asistencia manual
- Un administrador/equipo/tutor/coordinador puede registrar asistencia manualmente
- Útil cuando un chico no tiene celular o el QR falla

### RF-03: Gestión de participantes
- Crear, editar, buscar y desactivar participantes
- Búsqueda por nombre o DNI

### RF-04: Gestión de sedes
- Crear y editar sedes
- Generar código QR para cada sede
- Descargar QR en formato imprimible

### RF-05: Consulta de asistencia
- Ver asistencia por sede y fecha
- Filtrar por rango de fechas
- Ver historial de un participante específico
- Contador de asistencias por participante

### RF-06: Reportes básicos
- Total de asistencias por sede en un período
- Exportar a CSV (futuro)

## Requisitos NO Funcionales

### RNF-01: Rendimiento
- El registro de asistencia debe tardar menos de 2 segundos
- Soportar al menos 50 registros simultáneos

### RNF-02: Usabilidad
- La interfaz de escaneo QR debe funcionar en celulares de gama baja
- No requiere instalación (web responsive)
- Carga inicial menor a 3 segundos en 4G

### RNF-03: Seguridad
- Contraseñas hasheadas con bcrypt
- JWT para autenticación de administradores
- El endpoint de registro de asistencia NO requiere autenticación
  (solo necesita el código de sede válido)
- Rate limiting para prevenir abuso del endpoint de asistencia

### RNF-04: Disponibilidad
- El sistema debe funcionar en horario de actividades (14:00-20:00)
- Si se cae internet, se debe poder registrar manualmente después