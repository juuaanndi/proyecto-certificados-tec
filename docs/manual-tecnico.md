# Manual Técnico — AIR-TEC

## Arquitectura del Sistema

El sistema sigue el patrón MVC (Modelo-Vista-Controlador):

- **Modelo:** Acceso a datos Oracle Cloud mediante oracledb
- **Vista:** Vistas HTML en /src/views y frontend React
- **Controlador:** Lógica de negocio en /backend/src/controllers

## Base de Datos

- Motor: Oracle Autonomous Database (Always Free)
- Esquema: AIR_DEV
- Conexión: Via wallet SSL con TCPS
- 23 tablas con triggers de auditoría y vigencia

## Autenticación

- Proveedor: Firebase Authentication
- Método: Correo electrónico y contraseña
- Flujo: El frontend obtiene el ID token de Firebase y lo envía en cada request como Bearer token
- El middleware authMiddleware.js verifica el token en cada ruta protegida

## Triggers Importantes

### TRG_NORMATIVA_VIGENCIA
Cuando se inserta una nueva versión de un elemento normativo, marca automáticamente la versión anterior como HISTORICA.

### Triggers de Auditoría
Registran cada INSERT, UPDATE y DELETE en la tabla AUDITORIA con el usuario, fecha y datos afectados.

## Stored Procedures

### SP_VALIDAR_NOMBRAMIENTO
Valida que un asambleísta no tenga nombramientos activos con fechas que se traslapen en el mismo sector.

## Seguridad RBAC

Los roles se definen en la tabla ROL y se asignan en USUARIO_ROL. El sistema tiene tres roles:

- ADMINISTRADOR: acceso total
- SECRETARIA: puede crear y editar asambleístas, sesiones y certificaciones
- ASAMBLEISTA: solo lectura sobre normativa y sus propios datos

## Endpoints Principales

- GET /api/normativa/arbol — Árbol jerárquico de normativa vigente
- POST /api/normativa — Crear nodo con validación jerárquica
- GET /api/asambleistas — Listar asambleístas
- POST /api/nombramientos — Crear nombramiento con validación de traslape
- GET /api/pdf/certificado/:id — Generar PDF con formato normativo DAIR

## Generación de PDF

El módulo pdfController.js genera certificaciones en formato oficial DAIR usando pdfkit. Consulta las tablas CERTIFICACION, NOMBRAMIENTO, ASAMBLEISTA, ASISTENCIA, COMISION_TRABAJO e INTEGRANTE_COMISION para construir el documento completo.