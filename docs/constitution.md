# Constitución — Sistema de Gestión de Asistencia

Principios innegociables. Toda spec, plan, tarea e implementación debe cumplirlos.

1. **La spec manda**: ninguna funcionalidad se implementa si no existe una spec aprobada. Si falta una decisión necesaria o existe una contradicción, el agente debe detenerse y solicitar aclaración.

2. **Arquitectura por capas**: el dominio no depende de frameworks ni de infraestructura. Los casos de uso contienen la lógica de aplicación y no dependen de Express, HTTP ni detalles de persistencia. Los controllers coordinan la entrada y salida, pero no contienen lógica de negocio.

3. **Reglas de negocio en el dominio**: una regla que determina qué está permitido en el sistema debe existir en un único lugar. No duplicar reglas entre controllers, servicios, componentes frontend o consultas a la base de datos.

4. **Seguridad primero**: ninguna funcionalidad puede saltarse autenticación, autorización, validación de permisos o controles de acceso existentes. Los datos y operaciones deben respetar el rol del usuario autenticado.

5. **Integridad de los datos**: los cambios en entidades, relaciones o estructura de base de datos deben realizarse mediante migraciones. No realizar cambios destructivos ni introducir inconsistencias para resolver rápidamente una funcionalidad.

6. **API como contrato**: frontend y backend se comunican exclusivamente mediante los contratos definidos por la API. Los cambios incompatibles deben identificarse explícitamente y actualizar su documentación y consumidores.

7. **Tests como puerta**: una implementación no se considera terminada mientras las pruebas correspondientes fallen. Los cambios de lógica de negocio deben incluir o actualizar tests cuando corresponda.

8. **Cambios mínimos**: modificar únicamente lo necesario para cumplir la spec activa. No realizar refactors, mejoras de diseño, cambios de arquitectura ni actualizaciones de dependencias que no formen parte del alcance aprobado.

9. **Reutilización antes que duplicación**: antes de crear una nueva función, servicio, componente, hook o utilidad, buscar si ya existe una solución reutilizable. No crear abstracciones nuevas sin una necesidad concreta.

10. **Documentación sincronizada**: cuando una implementación cambia una decisión arquitectónica, regla de negocio, entidad, relación, contrato de API o comportamiento observable, la documentación correspondiente debe actualizarse en el mismo cambio.

11. **Código en inglés**: nombres de variables, funciones, clases, tipos, archivos y comentarios técnicos deben estar en inglés. La documentación del proyecto y la interfaz de usuario deben estar en español.

12. **No asumir decisiones**: si existen varias soluciones válidas y la elección afecta arquitectura, seguridad, datos, API o comportamiento del usuario, el agente debe detenerse y pedir una decisión en lugar de asumirla.