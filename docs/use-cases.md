# Casos de Uso

## UC-01: Registrar asistencia por QR
**Actor:** Participante
**Precondiciones:** La sede existe y tiene QR activo. El participante está registrado.

**Flujo principal:**
1. Participante escanea el QR con la cámara del celular
2. Se abre la URL: `https://sistema.cbj.org/asistencia/{locationId}`
3. El sistema muestra una lista de todos los participantes
4. El participante escribe su nombre en el campo de búsqueda
5. El sistema muestra coincidencias de participantes registrados
6. El participante selecciona su nombre
7. El sistema valida que no tenga asistencia registrada hoy en esa sede
8. El sistema crea el registro de asistencia
9. Se muestra mensaje: "✅ ¡Asistencia registrada! Bienvenido/a {nombre}"

**Flujos alternativos:**
- 4a. El participante no aparece en la búsqueda
  → Se muestra: "No te encontrás registrado. Pedile a un coordinador que te registre."
- 7a. Ya tiene asistencia registrada hoy
  → Se muestra: "Ya registraste tu asistencia hoy. ¡Nos vemos! 👋"

**Errores:**
- QR inválido o de sede inactiva → "Este código no es válido"
- Error de servidor → "Hubo un problema. Intentá de nuevo o avisale a un coordinador"

## UC-02: Registrar asistencia manualmente
**Actor:** Admin / Coordinador / Equipo / Tutor
**Precondiciones:** Usuario autenticado. Sede y participante existen.

**Flujo principal:**
1. Ingresa al panel de administración
2. Selecciona "Registrar asistencia"
3. Selecciona la sede
4. Busca al participante por nombre
5. Confirma el registro
6. El sistema crea la asistencia con la fecha/hora actual

## UC-03: Ver asistencia del día
**Actor:** Admin / Equipo
**Precondiciones:** Usuario autenticado.

**Flujo principal:**
1. Ingresa al dashboard
2. Ve la lista de asistencias del día por sede
3. Puede filtrar por sede específica
4. Ve el total de asistentes por sede

## UC-04: Consultar historial de un participante
**Actor:** Admin / Equipo / Coordinador
**Precondiciones:** Usuario autenticado. Participante existe.

**Flujo principal:**
1. Busca al participante
2. Ve su historial de asistencias
3. Puede filtrar por sede y rango de fechas
4. Ve el total de asistencias y porcentaje

## UC-05: Generar QR de una sede
**Actor:** Admin / Coordinador
**Precondiciones:** Usuario autenticado. Sede existe.

**Flujo principal:**
1. Va a gestión de sedes
2. Selecciona una sede
3. El sistema muestra el código QR
4. Admin puede descargarlo como imagen para imprimir