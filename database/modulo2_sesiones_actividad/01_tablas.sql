-- =====================================================
-- Sprint 2 - Módulo 2: Sesiones y Actividad
-- Archivo: 01_tablas.sql
-- Responsable: Sebastián Méndez Montero
-- Dependencias:
--   - PERIODO_AIR
--   - NOMBRAMIENTO
-- =====================================================
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
