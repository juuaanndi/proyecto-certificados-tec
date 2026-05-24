-- ============================================================
-- AIR-TEC: Script consolidado de Base de Datos
-- Instituto Tecnológico de Costa Rica
-- Asamblea Institucional Representativa
-- Ejecutar en esquema limpio AIR_DEV
-- ============================================================

-- ========================
-- MÓDULO 1: TABLAS BASE
-- ========================

CREATE TABLE SECTOR (
    id_sector NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL
);

CREATE TABLE PERIODO_AIR (
    id_periodo NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL,
    inicio DATE NOT NULL,
    fin DATE NOT NULL
);

CREATE TABLE ROL (
    id_rol NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL,
    descripcion VARCHAR2(200)
);

CREATE TABLE PERMISO (
    id_permiso NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_accion VARCHAR2(100) NOT NULL
);

CREATE TABLE ROL_PERMISO (
    id_rol NUMBER NOT NULL,
    id_permiso NUMBER NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_rolpermiso_rol FOREIGN KEY (id_rol) REFERENCES ROL(id_rol),
    CONSTRAINT fk_rolpermiso_permiso FOREIGN KEY (id_permiso) REFERENCES PERMISO(id_permiso)
);

CREATE TABLE USUARIO (
    id_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    email VARCHAR2(100) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    estado VARCHAR2(20) DEFAULT 'ACTIVO' NOT NULL,
    firebase_uid VARCHAR2(128),
    CONSTRAINT chk_usuario_estado CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO'))
);

CREATE TABLE USUARIO_ROL (
    id_usuario NUMBER NOT NULL,
    id_rol NUMBER NOT NULL,
    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_usuariorol_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    CONSTRAINT fk_usuariorol_rol FOREIGN KEY (id_rol) REFERENCES ROL(id_rol)
);

CREATE TABLE ASAMBLEISTA (
    id_asambleista NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(150) NOT NULL,
    cedula VARCHAR2(20) NOT NULL UNIQUE,
    correo VARCHAR2(100),
    id_usuario NUMBER,
    CONSTRAINT fk_asambleista_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

CREATE TABLE NOMBRAMIENTO (
    id_nombramiento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_asambleista NUMBER NOT NULL,
    id_periodo NUMBER NOT NULL,
    id_sector NUMBER NOT NULL,
    puesto VARCHAR2(100) NOT NULL,
    condicion VARCHAR2(20) NOT NULL,
    inicio DATE NOT NULL,
    fin DATE,
    estado VARCHAR2(20) DEFAULT 'VIGENTE' NOT NULL,
    num_resolucion VARCHAR2(50),
    CONSTRAINT fk_nombramiento_asambleista FOREIGN KEY (id_asambleista) REFERENCES ASAMBLEISTA(id_asambleista),
    CONSTRAINT fk_nombramiento_periodo FOREIGN KEY (id_periodo) REFERENCES PERIODO_AIR(id_periodo),
    CONSTRAINT fk_nombramiento_sector FOREIGN KEY (id_sector) REFERENCES SECTOR(id_sector),
    CONSTRAINT chk_nombramiento_estado CHECK (estado IN ('VIGENTE', 'FINALIZADO', 'RENUNCIADO', 'REVOCADO')),
    CONSTRAINT chk_nombramiento_condicion CHECK (condicion IN ('TITULAR', 'SUPLENTE')),
    CONSTRAINT chk_nombramiento_fechas CHECK (fin IS NULL OR fin > inicio)
);

CREATE TABLE AUDITORIA (
    id_auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario NUMBER NOT NULL,
    tipo VARCHAR2(50) NOT NULL,
    accion VARCHAR2(200) NOT NULL,
    fecha_hora TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);

-- Normativa recursiva
CREATE TABLE ELEMENTO_NORMATIVO (
    id_elemento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_padre NUMBER,
    tipo VARCHAR2(20) NOT NULL,
    titulo VARCHAR2(500),
    contenido VARCHAR2(4000),
    orden NUMBER,
    estado_vigencia VARCHAR2(20) DEFAULT 'VIGENTE' NOT NULL,
    fecha_inicio_vigencia DATE DEFAULT SYSDATE NOT NULL,
    fecha_fin_vigencia DATE,
    origen VARCHAR2(50),
    CONSTRAINT fk_elemento_padre FOREIGN KEY (id_padre) REFERENCES ELEMENTO_NORMATIVO(id_elemento),
    CONSTRAINT chk_elemento_tipo CHECK (tipo IN ('REGLAMENTO', 'TITULO', 'CAPITULO', 'ARTICULO', 'INCISO')),
    CONSTRAINT chk_elemento_estado CHECK (estado_vigencia IN ('VIGENTE', 'HISTORICA'))
);

-- ========================
-- MÓDULO 2: SESIONES
-- ========================

CREATE TABLE SESION (
    id_sesion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_periodo NUMBER NOT NULL,
    numero VARCHAR2(20) NOT NULL,
    fecha DATE NOT NULL,
    tipo VARCHAR2(20) NOT NULL,
    modalidad VARCHAR2(20) NOT NULL,
    quorum_minimo NUMBER,
    quorum_inicio NUMBER,
    CONSTRAINT fk_sesion_periodo FOREIGN KEY (id_periodo) REFERENCES PERIODO_AIR(id_periodo),
    CONSTRAINT chk_sesion_tipo CHECK (tipo IN ('ORDINARIA', 'EXTRAORDINARIA')),
    CONSTRAINT chk_sesion_modalidad CHECK (modalidad IN ('VIRTUAL', 'PRESENCIAL', 'MIXTA'))
);

CREATE TABLE ASISTENCIA (
    id_asistencia NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_nombramiento NUMBER NOT NULL,
    id_sesion NUMBER NOT NULL,
    asistio NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT fk_asistencia_nombramiento FOREIGN KEY (id_nombramiento) REFERENCES NOMBRAMIENTO(id_nombramiento),
    CONSTRAINT fk_asistencia_sesion FOREIGN KEY (id_sesion) REFERENCES SESION(id_sesion),
    CONSTRAINT chk_asistencia CHECK (asistio IN (0, 1)),
    CONSTRAINT uq_asistencia UNIQUE (id_nombramiento, id_sesion)
);

CREATE TABLE AGENDA (
    id_agenda NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_sesion NUMBER NOT NULL,
    estado VARCHAR2(20) DEFAULT 'PENDIENTE' NOT NULL,
    CONSTRAINT fk_agenda_sesion FOREIGN KEY (id_sesion) REFERENCES SESION(id_sesion),
    CONSTRAINT chk_agenda_estado CHECK (estado IN ('PENDIENTE', 'EN_CURSO', 'FINALIZADA')),
    CONSTRAINT uq_agenda_sesion UNIQUE (id_sesion)
);

CREATE TABLE PUNTO_AGENDA (
    id_punto NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_agenda NUMBER NOT NULL,
    orden NUMBER NOT NULL,
    contenido VARCHAR2(500) NOT NULL,
    estado VARCHAR2(20) DEFAULT 'PENDIENTE' NOT NULL,
    trata_sobre VARCHAR2(200),
    CONSTRAINT fk_punto_agenda FOREIGN KEY (id_agenda) REFERENCES AGENDA(id_agenda),
    CONSTRAINT chk_punto_estado CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'POSPUESTO'))
);

CREATE TABLE ACTA (
    id_acta NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_sesion NUMBER NOT NULL,
    url_documento VARCHAR2(500),
    quorum_inicio NUMBER,
    estado VARCHAR2(20) DEFAULT 'BORRADOR' NOT NULL,
    CONSTRAINT fk_acta_sesion FOREIGN KEY (id_sesion) REFERENCES SESION(id_sesion),
    CONSTRAINT chk_acta_estado CHECK (estado IN ('BORRADOR', 'APROBADA', 'ANULADA')),
    CONSTRAINT uq_acta_sesion UNIQUE (id_sesion)
);

CREATE TABLE COMISION_TRABAJO (
    id_comision NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_periodo NUMBER NOT NULL,
    nombre VARCHAR2(300) NOT NULL,
    inicio DATE,
    fin DATE,
    rol VARCHAR2(50),
    CONSTRAINT fk_comision_periodo FOREIGN KEY (id_periodo) REFERENCES PERIODO_AIR(id_periodo)
);

CREATE TABLE INTEGRANTE_COMISION (
    id_integrante NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_comision NUMBER NOT NULL,
    id_nombramiento NUMBER NOT NULL,
    inicio DATE,
    fin DATE,
    CONSTRAINT fk_integrante_comision FOREIGN KEY (id_comision) REFERENCES COMISION_TRABAJO(id_comision),
    CONSTRAINT fk_integrante_nombramiento FOREIGN KEY (id_nombramiento) REFERENCES NOMBRAMIENTO(id_nombramiento),
    CONSTRAINT uq_integrante UNIQUE (id_comision, id_nombramiento)
);

-- ========================
-- MÓDULO 3: PROPUESTAS Y CERTIFICACIONES
-- ========================

CREATE TABLE PROPUESTA (
    id_propuesta NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_periodo NUMBER NOT NULL,
    codigo_air VARCHAR2(50),
    titulo VARCHAR2(500) NOT NULL,
    tipo VARCHAR2(30) NOT NULL,
    es_base NUMBER(1) DEFAULT 1 NOT NULL,
    id_propuesta_padre NUMBER,
    CONSTRAINT fk_propuesta_periodo FOREIGN KEY (id_periodo) REFERENCES PERIODO_AIR(id_periodo),
    CONSTRAINT fk_propuesta_padre FOREIGN KEY (id_propuesta_padre) REFERENCES PROPUESTA(id_propuesta),
    CONSTRAINT chk_propuesta_tipo CHECK (tipo IN ('BASE', 'CONCILIADA')),
    CONSTRAINT chk_propuesta_esbase CHECK (es_base IN (0, 1))
);

CREATE TABLE PROPUESTA_SESION (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_propuesta NUMBER NOT NULL,
    id_sesion NUMBER NOT NULL,
    etapa VARCHAR2(30) NOT NULL,
    CONSTRAINT fk_propsesion_propuesta FOREIGN KEY (id_propuesta) REFERENCES PROPUESTA(id_propuesta),
    CONSTRAINT fk_propsesion_sesion FOREIGN KEY (id_sesion) REFERENCES SESION(id_sesion),
    CONSTRAINT chk_etapa CHECK (etapa IN ('PROCEDENCIA', 'APROBACION', 'CONCILIACION')),
    CONSTRAINT uq_propuesta_sesion UNIQUE (id_propuesta, id_sesion)
);

CREATE TABLE PROPOSITOR (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_propuesta NUMBER NOT NULL,
    id_nombramiento NUMBER NOT NULL,
    CONSTRAINT fk_propositor_propuesta FOREIGN KEY (id_propuesta) REFERENCES PROPUESTA(id_propuesta),
    CONSTRAINT fk_propositor_nombramiento FOREIGN KEY (id_nombramiento) REFERENCES NOMBRAMIENTO(id_nombramiento),
    CONSTRAINT uq_propositor UNIQUE (id_propuesta, id_nombramiento)
);

CREATE TABLE COMISION_PROPUESTA (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_comision NUMBER NOT NULL,
    id_propuesta NUMBER NOT NULL,
    CONSTRAINT fk_comprop_comision FOREIGN KEY (id_comision) REFERENCES COMISION_TRABAJO(id_comision),
    CONSTRAINT fk_comprop_propuesta FOREIGN KEY (id_propuesta) REFERENCES PROPUESTA(id_propuesta),
    CONSTRAINT uq_comision_propuesta UNIQUE (id_comision, id_propuesta)
);

CREATE TABLE RESOLUCION (
    id_resolucion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_propuesta NUMBER NOT NULL,
    id_sesion NUMBER NOT NULL,
    fecha_emision DATE NOT NULL,
    numero_resolucion VARCHAR2(50),
    texto_del_resultado VARCHAR2(1000),
    fundamenta VARCHAR2(1000),
    considerando VARCHAR2(1000),
    CONSTRAINT fk_resolucion_propuesta FOREIGN KEY (id_propuesta) REFERENCES PROPUESTA(id_propuesta),
    CONSTRAINT fk_resolucion_sesion FOREIGN KEY (id_sesion) REFERENCES SESION(id_sesion)
);

CREATE TABLE CERTIFICACION (
    id_certificacion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_nombramiento NUMBER NOT NULL,
    id_usuario_emisor NUMBER NOT NULL,
    numero_documento VARCHAR2(50) NOT NULL UNIQUE,
    fecha_emision DATE DEFAULT SYSDATE NOT NULL,
    snapshot CLOB,
    estado VARCHAR2(20) DEFAULT 'VIGENTE' NOT NULL,
    descripcion_motivo_anulado VARCHAR2(500),
    CONSTRAINT fk_cert_nombramiento FOREIGN KEY (id_nombramiento) REFERENCES NOMBRAMIENTO(id_nombramiento),
    CONSTRAINT fk_cert_emisor FOREIGN KEY (id_usuario_emisor) REFERENCES USUARIO(id_usuario),
    CONSTRAINT chk_cert_estado CHECK (estado IN ('VIGENTE', 'ANULADA'))
);

CREATE TABLE SOLICITUD (
    id_solicitud NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_nombramiento NUMBER NOT NULL,
    fecha_solicitud DATE DEFAULT SYSDATE NOT NULL,
    estado VARCHAR2(20) DEFAULT 'PENDIENTE' NOT NULL,
    id_certificacion NUMBER,
    CONSTRAINT fk_solicitud_nombramiento FOREIGN KEY (id_nombramiento) REFERENCES NOMBRAMIENTO(id_nombramiento),
    CONSTRAINT fk_solicitud_certificacion FOREIGN KEY (id_certificacion) REFERENCES CERTIFICACION(id_certificacion),
    CONSTRAINT chk_solicitud_estado CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'ANULADA'))
);

-- ========================
-- ÍNDICES
-- ========================

CREATE UNIQUE INDEX uq_nombramiento_vigente
ON NOMBRAMIENTO (
    id_asambleista, id_sector, id_periodo,
    CASE WHEN estado = 'VIGENTE' THEN 'VIGENTE' ELSE NULL END
);

-- ========================
-- TRIGGERS
-- ========================

CREATE OR REPLACE TRIGGER trg_auditoria_nombramiento
AFTER INSERT OR UPDATE OR DELETE ON NOMBRAMIENTO
FOR EACH ROW
DECLARE
    v_accion VARCHAR2(10);
    v_id_usuario NUMBER := 1;
BEGIN
    IF INSERTING THEN v_accion := 'INSERT';
    ELSIF UPDATING THEN v_accion := 'UPDATE';
    ELSE v_accion := 'DELETE';
    END IF;
    INSERT INTO AUDITORIA (id_usuario, tipo, accion, fecha_hora)
    VALUES (v_id_usuario, 'NOMBRAMIENTO',
            v_accion || ' en NOMBRAMIENTO id=' ||
            COALESCE(TO_CHAR(:NEW.id_nombramiento), TO_CHAR(:OLD.id_nombramiento)),
            SYSTIMESTAMP);
END;
/

CREATE OR REPLACE TRIGGER trg_vigencia_normativa
BEFORE INSERT ON ELEMENTO_NORMATIVO
FOR EACH ROW
BEGIN
    IF :NEW.estado_vigencia = 'VIGENTE' AND :NEW.id_padre IS NOT NULL THEN
        UPDATE ELEMENTO_NORMATIVO
        SET estado_vigencia = 'HISTORICA',
            fecha_fin_vigencia = SYSDATE
        WHERE id_padre = :NEW.id_padre
        AND tipo = :NEW.tipo
        AND estado_vigencia = 'VIGENTE';
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_auditoria_normativa
AFTER INSERT OR UPDATE OR DELETE ON ELEMENTO_NORMATIVO
FOR EACH ROW
DECLARE
    v_accion VARCHAR2(10);
    v_id_usuario NUMBER := 1;
BEGIN
    IF INSERTING THEN v_accion := 'INSERT';
    ELSIF UPDATING THEN v_accion := 'UPDATE';
    ELSE v_accion := 'DELETE';
    END IF;
    INSERT INTO AUDITORIA (id_usuario, tipo, accion, fecha_hora)
    VALUES (v_id_usuario, 'NORMATIVA',
            v_accion || ' en ELEMENTO_NORMATIVO id=' ||
            COALESCE(TO_CHAR(:NEW.id_elemento), TO_CHAR(:OLD.id_elemento)),
            SYSTIMESTAMP);
END;
/

-- ========================
-- STORED PROCEDURES
-- ========================

CREATE OR REPLACE PROCEDURE crear_usuario(
    p_username IN VARCHAR2, p_email IN VARCHAR2,
    p_password IN VARCHAR2, p_id_rol IN NUMBER
) AS
    v_id_usuario NUMBER;
BEGIN
    INSERT INTO USUARIO (username, email, password_hash, estado)
    VALUES (p_username, p_email, p_password, 'ACTIVO')
    RETURNING id_usuario INTO v_id_usuario;
    INSERT INTO USUARIO_ROL (id_usuario, id_rol) VALUES (v_id_usuario, p_id_rol);
    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'El username o email ya existe');
    WHEN OTHERS THEN ROLLBACK; RAISE;
END crear_usuario;
/

CREATE OR REPLACE PROCEDURE crear_asambleista(
    p_nombre IN VARCHAR2, p_cedula IN VARCHAR2,
    p_correo IN VARCHAR2, p_id_usuario IN NUMBER
) AS
BEGIN
    INSERT INTO ASAMBLEISTA (nombre, cedula, correo, id_usuario)
    VALUES (p_nombre, p_cedula, p_correo, p_id_usuario);
    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'La cédula ya está registrada');
    WHEN OTHERS THEN ROLLBACK; RAISE;
END crear_asambleista;
/

CREATE OR REPLACE PROCEDURE SP_VALIDAR_NOMBRAMIENTO(
    p_id_asambleista IN NUMBER, p_id_sector IN NUMBER,
    p_inicio IN DATE, p_fin IN DATE
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM NOMBRAMIENTO
    WHERE id_asambleista = p_id_asambleista AND id_sector = p_id_sector
    AND estado = 'VIGENTE'
    AND ((p_inicio BETWEEN inicio AND NVL(fin, DATE '9999-12-31'))
    OR (NVL(p_fin, DATE '9999-12-31') BETWEEN inicio AND NVL(fin, DATE '9999-12-31'))
    OR (inicio BETWEEN p_inicio AND NVL(p_fin, DATE '9999-12-31')));
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'El asambleísta ya tiene un nombramiento activo en este sector para el período indicado.');
    END IF;
END SP_VALIDAR_NOMBRAMIENTO;
/

CREATE OR REPLACE PROCEDURE registrar_auditoria(
    p_id_usuario IN NUMBER, p_tipo IN VARCHAR2, p_accion IN VARCHAR2
) AS
BEGIN
    INSERT INTO AUDITORIA (id_usuario, tipo, accion, fecha_hora)
    VALUES (p_id_usuario, p_tipo, p_accion, SYSTIMESTAMP);
    COMMIT;
END registrar_auditoria;
/

CREATE OR REPLACE PROCEDURE crear_sesion(
    p_id_periodo IN NUMBER, p_numero IN VARCHAR2, p_fecha IN DATE,
    p_tipo IN VARCHAR2, p_modalidad IN VARCHAR2, p_quorum_minimo IN NUMBER
) AS
    v_id_sesion NUMBER;
BEGIN
    INSERT INTO SESION (id_periodo, numero, fecha, tipo, modalidad, quorum_minimo)
    VALUES (p_id_periodo, p_numero, p_fecha, p_tipo, p_modalidad, p_quorum_minimo)
    RETURNING id_sesion INTO v_id_sesion;
    INSERT INTO AGENDA (id_sesion, estado) VALUES (v_id_sesion, 'PENDIENTE');
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN ROLLBACK; RAISE;
END crear_sesion;
/

CREATE OR REPLACE PROCEDURE emitir_certificacion(
    p_id_solicitud IN NUMBER, p_id_usuario_emisor IN NUMBER,
    p_numero_documento IN VARCHAR2, p_id_certificacion OUT NUMBER
) AS
    v_id_nombramiento NUMBER;
BEGIN
    SELECT id_nombramiento INTO v_id_nombramiento
    FROM SOLICITUD WHERE id_solicitud = p_id_solicitud AND estado = 'PENDIENTE';
    INSERT INTO CERTIFICACION (id_nombramiento, id_usuario_emisor, numero_documento, fecha_emision, estado)
    VALUES (v_id_nombramiento, p_id_usuario_emisor, p_numero_documento, SYSDATE, 'VIGENTE')
    RETURNING id_certificacion INTO p_id_certificacion;
    UPDATE SOLICITUD SET estado = 'APROBADA', id_certificacion = p_id_certificacion
    WHERE id_solicitud = p_id_solicitud;
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN ROLLBACK;
        RAISE_APPLICATION_ERROR(-20005, 'Solicitud no encontrada o ya procesada');
    WHEN OTHERS THEN ROLLBACK; RAISE;
END emitir_certificacion;
/

-- ========================
-- DATOS SEMILLA
-- ========================

INSERT INTO ROL (nombre, descripcion) VALUES ('ADMINISTRADOR', 'Acceso total al sistema');
INSERT INTO ROL (nombre, descripcion) VALUES ('SECRETARIA', 'Gestión de asambleístas y certificaciones');
INSERT INTO ROL (nombre, descripcion) VALUES ('ASAMBLEISTA', 'Solo lectura');

INSERT INTO SECTOR (nombre) VALUES ('Docente');
INSERT INTO SECTOR (nombre) VALUES ('Administrativo');
INSERT INTO SECTOR (nombre) VALUES ('Estudiantil');
INSERT INTO SECTOR (nombre) VALUES ('Consejo Institucional');

INSERT INTO PERIODO_AIR (nombre, inicio, fin) VALUES ('Período 2021-2025', DATE '2021-01-01', DATE '2025-12-31');

INSERT INTO USUARIO (username, email, password_hash, estado)
VALUES ('admin_air', 'admin@tec.ac.cr', 'firebase_auth', 'ACTIVO');
INSERT INTO USUARIO (username, email, password_hash, estado)
VALUES ('secretaria', 'secretaria@tec.ac.cr', 'firebase_auth', 'ACTIVO');
INSERT INTO USUARIO (username, email, password_hash, estado)
VALUES ('asambleista', 'asambleista@tec.ac.cr', 'firebase_auth', 'ACTIVO');

INSERT INTO PERMISO (nombre_accion) VALUES ('ACCESO_SISTEMA');

INSERT INTO ROL_PERMISO VALUES (1, 1);
INSERT INTO ROL_PERMISO VALUES (2, 1);
INSERT INTO ROL_PERMISO VALUES (3, 1);

INSERT INTO ASAMBLEISTA (nombre, cedula, correo, id_usuario)
VALUES ('Ana Rosa Ruiz Fernández', '302480440', 'ana.ruiz@tec.ac.cr', 1);

INSERT INTO NOMBRAMIENTO (id_asambleista, id_periodo, id_sector, puesto, condicion, inicio, estado)
VALUES (1, 1, 4, 'Representante Consejo Institucional', 'TITULAR', DATE '2021-01-01', 'VIGENTE');

INSERT INTO ELEMENTO_NORMATIVO (id_padre, tipo, titulo, contenido, orden)
VALUES (NULL, 'TITULO', 'Disposiciones Generales', 'Disposiciones generales del reglamento de la AIR', 1);
INSERT INTO ELEMENTO_NORMATIVO (id_padre, tipo, titulo, contenido, orden)
VALUES (1, 'CAPITULO', 'Objeto y Ámbito', 'Capítulo sobre el objeto y ámbito del reglamento', 1);
INSERT INTO ELEMENTO_NORMATIVO (id_padre, tipo, titulo, contenido, orden)
VALUES (2, 'ARTICULO', 'Artículo 1', 'El presente reglamento regula el funcionamiento de la AIR del TEC', 1);
INSERT INTO ELEMENTO_NORMATIVO (id_padre, tipo, titulo, contenido, orden)
VALUES (3, 'INCISO', 'Inciso a)', 'Establecer las políticas generales de la institución', 1);

COMMIT;