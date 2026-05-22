# Diccionario de Datos — AIR-TEC

## USUARIO
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_USUARIO | NUMBER | PK, NOT NULL | Identificador único del usuario |
| USERNAME | VARCHAR2(100) | NOT NULL, UNIQUE | Nombre de usuario para login |
| EMAIL | VARCHAR2(150) | NOT NULL, UNIQUE | Correo electrónico institucional |
| PASSWORD_HASH | VARCHAR2(255) | NOT NULL | Contraseña encriptada |
| ESTADO | VARCHAR2(20) | CHECK (ACTIVO, INACTIVO) | Estado de la cuenta |
| FIREBASE_UID | VARCHAR2(128) | UNIQUE | UID de Firebase Authentication |

## ASAMBLEISTA
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_ASAMBLEISTA | NUMBER | PK, NOT NULL | Identificador único del asambleísta |
| NOMBRE | VARCHAR2(200) | NOT NULL | Nombre completo |
| CEDULA | VARCHAR2(20) | NOT NULL, UNIQUE | Cédula de identidad |
| CORREO | VARCHAR2(150) | — | Correo electrónico |
| ID_USUARIO | NUMBER | FK → USUARIO | Usuario asociado al asambleísta |

## NOMBRAMIENTO
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_NOMBRAMIENTO | NUMBER | PK, NOT NULL | Identificador único |
| ID_ASAMBLEISTA | NUMBER | FK → ASAMBLEISTA, NOT NULL | Asambleísta nombrado |
| ID_PERIODO | NUMBER | FK → PERIODO_AIR, NOT NULL | Período de gestión |
| ID_SECTOR | NUMBER | FK → SECTOR, NOT NULL | Sector que representa |
| PUESTO | VARCHAR2(100) | NOT NULL | Cargo o puesto |
| CONDICION | VARCHAR2(20) | CHECK (PROPIETARIO, SUPLENTE) | Condición del nombramiento |
| INICIO | DATE | NOT NULL | Fecha de inicio |
| FIN | DATE | — | Fecha de fin (NULL si vigente) |
| ESTADO | VARCHAR2(20) | CHECK (ACTIVO, INACTIVO) | Estado actual |
| NUM_RESOLUCION | VARCHAR2(50) | — | Número de resolución asociada |

## NORMATIVA
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_NORMATIVA | NUMBER | PK, NOT NULL | Identificador único |
| ID_PADRE | NUMBER | FK → NORMATIVA (recursiva) | Nodo padre en la jerarquía |
| NIVEL | VARCHAR2(20) | CHECK (TITULO, CAPITULO, ARTICULO, INCISO) | Nivel jerárquico |
| CODIGO | VARCHAR2(50) | NOT NULL | Código identificador del nodo |
| TITULO | VARCHAR2(500) | NOT NULL | Título del elemento normativo |
| CONTENIDO | CLOB | — | Texto completo del artículo o inciso |
| ESTADO_VIGENCIA | VARCHAR2(20) | CHECK (VIGENTE, HISTORICA) | Estado de vigencia |
| FECHA_INICIO_VIGENCIA | DATE | DEFAULT SYSDATE | Fecha desde que está vigente |
| FECHA_FIN_VIGENCIA | DATE | — | Fecha en que dejó de estar vigente |
| VERSION | NUMBER | DEFAULT 1 | Número de versión |

> **Lógica recursiva:** Un TITULO puede contener CAPITULOs, un CAPITULO puede contener ARTICULOs, y un ARTICULO puede contener INCISOs. El campo ID_PADRE implementa esta jerarquía.
> **Control de vigencia:** El trigger TRG_NORMATIVA_VIGENCIA marca automáticamente la versión anterior como HISTORICA al insertar una nueva versión del mismo CODIGO.

## SESION
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_SESION | NUMBER | PK, NOT NULL | Identificador único |
| ID_PERIODO | NUMBER | FK → PERIODO_AIR, NOT NULL | Período al que pertenece |
| NUMERO | VARCHAR2(20) | NOT NULL | Número de sesión (ej: AIR-96-2019) |
| FECHA | DATE | NOT NULL | Fecha de la sesión |
| TIPO | VARCHAR2(20) | NOT NULL | Ordinaria o Extraordinaria |
| MODALIDAD | VARCHAR2(20) | NOT NULL | Presencial, Virtual o Mixta |
| QUORUM_MINIMO | NUMBER | NOT NULL | Quórum mínimo requerido |
| QUORUM_INICIO | NUMBER | — | Quórum al inicio de la sesión |

## CERTIFICACION
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_CERTIFICACION | NUMBER | PK, NOT NULL | Identificador único |
| ID_NOMBRAMIENTO | NUMBER | FK → NOMBRAMIENTO, NOT NULL | Nombramiento certificado |
| ID_USUARIO_EMISOR | NUMBER | FK → USUARIO, NOT NULL | Usuario que emite la certificación |
| NUMERO_DOCUMENTO | VARCHAR2(50) | NOT NULL | Número del documento (ej: DAIR-009-2025) |
| FECHA_EMISION | DATE | NOT NULL | Fecha de emisión |
| SNAPSHOT | CLOB | — | Copia del contenido al momento de emisión |
| ESTADO | VARCHAR2(20) | CHECK (ACTIVO, ANULADO) | Estado de la certificación |
| DESCRIPCION_MOTIVO_ANULADO | VARCHAR2(500) | — | Motivo de anulación si aplica |

## ROL
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_ROL | NUMBER | PK, NOT NULL | Identificador único |
| NOMBRE | VARCHAR2(50) | NOT NULL, UNIQUE | Nombre del rol (ADMINISTRADOR, SECRETARIA, ASAMBLEISTA) |
| DESCRIPCION | VARCHAR2(200) | — | Descripción del rol |

## AUDITORIA
| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| ID_AUDITORIA | NUMBER | PK, NOT NULL | Identificador único |
| TABLA_AFECTADA | VARCHAR2(100) | NOT NULL | Nombre de la tabla modificada |
| OPERACION | VARCHAR2(10) | CHECK (INSERT, UPDATE, DELETE) | Tipo de operación |
| ID_REGISTRO | NUMBER | NOT NULL | ID del registro afectado |
| USUARIO | VARCHAR2(100) | NOT NULL | Usuario que realizó la operación |
| FECHA | DATE | DEFAULT SYSDATE | Fecha y hora de la operación |
| DATOS_ANTERIORES | CLOB | — | Datos antes del cambio |
| DATOS_NUEVOS | CLOB | — | Datos después del cambio |