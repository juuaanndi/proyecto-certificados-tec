-- =====================================================
-- Sprint 2 - Módulo 2: Sesiones y Actividad
-- Archivo: 02_stored_procedures.sql
-- Responsable: Sebastián Méndez Montero
-- Dependencias:
--   - SESION
--   - ASISTENCIA
--   - COMISION_TRABAJO
-- =====================================================
CREATE OR REPLACE PROCEDURE crear_sesion(
    p_id_periodo    IN NUMBER,
    p_numero        IN VARCHAR2,
    p_fecha         IN DATE,
    p_tipo          IN VARCHAR2,
    p_modalidad     IN VARCHAR2,
    p_quorum_minimo IN NUMBER
) AS
    v_id_sesion NUMBER;
BEGIN
    INSERT INTO SESION (id_periodo, numero, fecha, tipo, modalidad, quorum_minimo)
    VALUES (p_id_periodo, p_numero, p_fecha, p_tipo, p_modalidad, p_quorum_minimo)
    RETURNING id_sesion INTO v_id_sesion;

    INSERT INTO AGENDA (id_sesion, estado)
    VALUES (v_id_sesion, 'PENDIENTE');

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END crear_sesion;
/

CREATE OR REPLACE PROCEDURE registrar_asistencia(
    p_id_nombramiento IN NUMBER,
    p_id_sesion       IN NUMBER,
    p_asistio         IN NUMBER
) AS
BEGIN
    MERGE INTO ASISTENCIA a
    USING DUAL
    ON (a.id_nombramiento = p_id_nombramiento AND a.id_sesion = p_id_sesion)
    WHEN MATCHED THEN
        UPDATE SET asistio = p_asistio
    WHEN NOT MATCHED THEN
        INSERT (id_nombramiento, id_sesion, asistio)
        VALUES (p_id_nombramiento, p_id_sesion, p_asistio);

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END registrar_asistencia;
/

CREATE OR REPLACE PROCEDURE crear_comision(
    p_id_periodo  IN NUMBER,
    p_nombre      IN VARCHAR2,
    p_inicio      IN DATE,
    p_fin         IN DATE,
    p_rol         IN VARCHAR2,
    p_id_comision OUT NUMBER
) AS
BEGIN
    INSERT INTO COMISION_TRABAJO (id_periodo, nombre, inicio, fin, rol)
    VALUES (p_id_periodo, p_nombre, p_inicio, p_fin, p_rol)
    RETURNING id_comision INTO p_id_comision;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END crear_comision;
/

CREATE OR REPLACE PROCEDURE agregar_integrante_comision(
    p_id_comision     IN NUMBER,
    p_id_nombramiento IN NUMBER,
    p_inicio          IN DATE,
    p_fin             IN DATE
) AS
BEGIN
    INSERT INTO INTEGRANTE_COMISION (id_comision, id_nombramiento, inicio, fin)
    VALUES (p_id_comision, p_id_nombramiento, p_inicio, p_fin);

    COMMIT;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20004, 'El asambleísta ya es integrante de esta comisión');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END agregar_integrante_comision;
/

CREATE OR REPLACE PROCEDURE obtener_asistencia_por_sesion(
    p_id_sesion IN NUMBER,
    p_cursor    OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT
            a.id_asambleista,
            a.nombre,
            a.cedula,
            n.puesto,
            s.nombre AS sector,
            ast.asistio
        FROM ASISTENCIA ast
        JOIN NOMBRAMIENTO n ON ast.id_nombramiento = n.id_nombramiento
        JOIN ASAMBLEISTA a ON n.id_asambleista = a.id_asambleista
        JOIN SECTOR s ON n.id_sector = s.id_sector
        WHERE ast.id_sesion = p_id_sesion
        ORDER BY a.nombre ASC;
END obtener_asistencia_por_sesion;
/

CREATE OR REPLACE PROCEDURE obtener_comisiones_por_nombramiento(
    p_id_nombramiento IN NUMBER,
    p_cursor          OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT
            c.id_comision,
            c.nombre,
            c.inicio,
            c.fin,
            c.rol,
            p.nombre AS periodo,
            ic.inicio AS inicio_participacion,
            ic.fin AS fin_participacion
        FROM INTEGRANTE_COMISION ic
        JOIN COMISION_TRABAJO c ON ic.id_comision = c.id_comision
        JOIN PERIODO_AIR p ON c.id_periodo = p.id_periodo
        WHERE ic.id_nombramiento = p_id_nombramiento
        ORDER BY c.inicio ASC;
END obtener_comisiones_por_nombramiento;
/
