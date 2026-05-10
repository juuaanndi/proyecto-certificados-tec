-- ========================
-- MÓDULO 1: BASE DEL SISTEMA
-- STORED PROCEDURES
-- ========================

CREATE OR REPLACE PROCEDURE crear_usuario(
    p_username    IN VARCHAR2,
    p_email       IN VARCHAR2,
    p_password    IN VARCHAR2,
    p_id_rol      IN NUMBER
) AS
    v_id_usuario NUMBER;
BEGIN
    INSERT INTO USUARIO (username, email, password_hash, estado)
    VALUES (p_username, p_email, p_password, 'ACTIVO')
    RETURNING id_usuario INTO v_id_usuario;

    INSERT INTO USUARIO_ROL (id_usuario, id_rol)
    VALUES (v_id_usuario, p_id_rol);

    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20001, 'El username o email ya existe');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END crear_usuario;
/

CREATE OR REPLACE PROCEDURE crear_asambleista(
    p_nombre     IN VARCHAR2,
    p_cedula     IN VARCHAR2,
    p_correo     IN VARCHAR2,
    p_id_usuario IN NUMBER
) AS
BEGIN
    INSERT INTO ASAMBLEISTA (nombre, cedula, correo, id_usuario)
    VALUES (p_nombre, p_cedula, p_correo, p_id_usuario);

    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20002, 'La cédula ya está registrada');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END crear_asambleista;
/

CREATE OR REPLACE PROCEDURE crear_nombramiento(
    p_id_asambleista IN NUMBER,
    p_id_periodo     IN NUMBER,
    p_id_sector      IN NUMBER,
    p_puesto         IN VARCHAR2,
    p_condicion      IN VARCHAR2,
    p_inicio         IN DATE,
    p_fin            IN DATE,
    p_num_resolucion IN VARCHAR2
) AS
BEGIN
    INSERT INTO NOMBRAMIENTO (
        id_asambleista, id_periodo, id_sector,
        puesto, condicion, inicio, fin,
        estado, num_resolucion
    )
    VALUES (
        p_id_asambleista, p_id_periodo, p_id_sector,
        p_puesto, p_condicion, p_inicio, p_fin,
        'VIGENTE', p_num_resolucion
    );

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END crear_nombramiento;
/

CREATE OR REPLACE PROCEDURE actualizar_estado_nombramiento(
    p_id_nombramiento IN NUMBER,
    p_estado          IN VARCHAR2,
    p_fin             IN DATE
) AS
BEGIN
    UPDATE NOMBRAMIENTO
    SET estado = p_estado,
        fin = p_fin
    WHERE id_nombramiento = p_id_nombramiento;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Nombramiento no encontrado');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END actualizar_estado_nombramiento;
/

CREATE OR REPLACE PROCEDURE registrar_auditoria(
    p_id_usuario IN NUMBER,
    p_tipo       IN VARCHAR2,
    p_accion     IN VARCHAR2
) AS
BEGIN
    INSERT INTO AUDITORIA (id_usuario, tipo, accion, fecha_hora)
    VALUES (p_id_usuario, p_tipo, p_accion, SYSTIMESTAMP);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END registrar_auditoria;
/

CREATE OR REPLACE PROCEDURE obtener_perfil_asambleista(
    p_id_asambleista IN NUMBER,
    p_cursor         OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT 
            a.id_asambleista,
            a.nombre,
            a.cedula,
            a.correo,
            n.id_nombramiento,
            n.puesto,
            n.condicion,
            n.inicio,
            n.fin,
            n.estado,
            n.num_resolucion,
            p.nombre AS periodo,
            p.inicio AS periodo_inicio,
            p.fin AS periodo_fin,
            s.nombre AS sector
        FROM ASAMBLEISTA a
        JOIN NOMBRAMIENTO n ON a.id_asambleista = n.id_asambleista
        JOIN PERIODO_AIR p ON n.id_periodo = p.id_periodo
        JOIN SECTOR s ON n.id_sector = s.id_sector
        WHERE a.id_asambleista = p_id_asambleista;
END obtener_perfil_asambleista;
/

CREATE OR REPLACE PROCEDURE buscar_asambleistas_por_periodo(
    p_id_periodo IN NUMBER,
    p_cursor     OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT 
            a.id_asambleista,
            a.nombre,
            a.cedula,
            n.puesto,
            n.condicion,
            n.estado,
            n.inicio,
            n.fin,
            s.nombre AS sector
        FROM ASAMBLEISTA a
        JOIN NOMBRAMIENTO n ON a.id_asambleista = n.id_asambleista
        JOIN SECTOR s ON n.id_sector = s.id_sector
        WHERE n.id_periodo = p_id_periodo
        ORDER BY a.nombre ASC;
END buscar_asambleistas_por_periodo;
/