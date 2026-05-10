-- ========================
-- MÓDULO 1: BASE DEL SISTEMA
-- TABLAS
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
    CONSTRAINT chk_nombramiento_condicion CHECK (condicion IN ('TITULAR', 'SUPLENTE'))
);

CREATE TABLE AUDITORIA (
    id_auditoria NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario NUMBER NOT NULL,
    tipo VARCHAR2(50) NOT NULL,
    accion VARCHAR2(200) NOT NULL,
    fecha_hora TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
);