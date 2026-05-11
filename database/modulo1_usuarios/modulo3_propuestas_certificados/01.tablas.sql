-- ========================
-- Módulo 3: propuestas-certificados
-- Tablas
-- Por: Alejandro Zúñiga Martinez
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