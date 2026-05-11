
-- ========================
-- Módulo 3: propuestas-certificados
-- Stored procedures
-- Por: Alejandro Zúñiga Martinez
-- ========================

CREATE OR REPLACE PROCEDURE crear_solicitud(
    p_id_nombramiento IN NUMBER,
    p_id_solicitud    OUT NUMBER
) AS
BEGIN
    INSERT INTO SOLICITUD (id_nombramiento, fecha_solicitud, estado)
    VALUES (p_id_nombramiento, SYSDATE, 'PENDIENTE')
    RETURNING id_solicitud INTO p_id_solicitud;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END crear_solicitud;
/

CREATE OR REPLACE PROCEDURE emitir_certificacion(
    p_id_solicitud      IN NUMBER,
    p_id_usuario_emisor IN NUMBER,
    p_numero_documento  IN VARCHAR2,
    p_id_certificacion  OUT NUMBER
) AS
    v_id_nombramiento NUMBER;
BEGIN
    SELECT id_nombramiento INTO v_id_nombramiento
    FROM SOLICITUD
    WHERE id_solicitud = p_id_solicitud
    AND estado = 'PENDIENTE';

    INSERT INTO CERTIFICACION (
        id_nombramiento,
        id_usuario_emisor,
        numero_documento,
        fecha_emision,
        estado
    )
    VALUES (
        v_id_nombramiento,
        p_id_usuario_emisor,
        p_numero_documento,
        SYSDATE,
        'VIGENTE'
    )
    RETURNING id_certificacion INTO p_id_certificacion;

    UPDATE SOLICITUD
    SET estado = 'APROBADA',
        id_certificacion = p_id_certificacion
    WHERE id_solicitud = p_id_solicitud;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20005, 'Solicitud no encontrada o ya procesada');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END emitir_certificacion;
/

CREATE OR REPLACE PROCEDURE obtener_datos_certificado(
    p_id_nombramiento   IN NUMBER,
    p_cursor_general    OUT SYS_REFCURSOR,
    p_cursor_sesiones   OUT SYS_REFCURSOR,
    p_cursor_comisiones OUT SYS_REFCURSOR,
    p_cursor_propuestas OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor_general FOR
        SELECT
            a.nombre,
            a.cedula,
            n.puesto,
            n.condicion,
            n.inicio,
            n.fin,
            n.estado,
            n.num_resolucion,
            p.nombre AS periodo,
            s.nombre AS sector
        FROM NOMBRAMIENTO n
        JOIN ASAMBLEISTA a ON n.id_asambleista = a.id_asambleista
        JOIN PERIODO_AIR p ON n.id_periodo = p.id_periodo
        JOIN SECTOR s ON n.id_sector = s.id_sector
        WHERE n.id_nombramiento = p_id_nombramiento;

    OPEN p_cursor_sesiones FOR
        SELECT
            COUNT(*) AS total_sesiones,
            SUM(ast.asistio) AS sesiones_asistidas
        FROM SESION ses
        JOIN NOMBRAMIENTO n ON n.id_periodo = ses.id_periodo
        LEFT JOIN ASISTENCIA ast ON ast.id_sesion = ses.id_sesion
            AND ast.id_nombramiento = p_id_nombramiento
        WHERE n.id_nombramiento = p_id_nombramiento;

    OPEN p_cursor_comisiones FOR
        SELECT
            c.nombre,
            c.inicio,
            c.fin,
            c.rol
        FROM INTEGRANTE_COMISION ic
        JOIN COMISION_TRABAJO c ON ic.id_comision = c.id_comision
        WHERE ic.id_nombramiento = p_id_nombramiento
        ORDER BY c.inicio ASC;

    OPEN p_cursor_propuestas FOR
        SELECT
            pr.codigo_air,
            pr.titulo,
            pr.tipo,
            ses.numero AS sesion_aprobacion,
            ses.fecha AS fecha_aprobacion
        FROM PROPOSITOR pos
        JOIN PROPUESTA pr ON pos.id_propuesta = pr.id_propuesta
        LEFT JOIN PROPUESTA_SESION ps ON pr.id_propuesta = ps.id_propuesta
        LEFT JOIN SESION ses ON ps.id_sesion = ses.id_sesion
        WHERE pos.id_nombramiento = p_id_nombramiento
        ORDER BY ses.fecha ASC;
END obtener_datos_certificado;
/

CREATE OR REPLACE PROCEDURE anular_certificacion(
    p_id_certificacion IN NUMBER,
    p_motivo           IN VARCHAR2
) AS
BEGIN
    UPDATE CERTIFICACION
    SET estado = 'ANULADA',
        descripcion_motivo_anulado = p_motivo
    WHERE id_certificacion = p_id_certificacion;

    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Certificación no encontrada');
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END anular_certificacion;
/

CREATE OR REPLACE PROCEDURE obtener_solicitudes_pendientes(
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT
            s.id_solicitud,
            s.fecha_solicitud,
            s.estado,
            a.nombre AS asambleista,
            a.cedula,
            n.puesto,
            n.condicion,
            p.nombre AS periodo,
            sec.nombre AS sector
        FROM SOLICITUD s
        JOIN NOMBRAMIENTO n ON s.id_nombramiento = n.id_nombramiento
        JOIN ASAMBLEISTA a ON n.id_asambleista = a.id_asambleista
        JOIN PERIODO_AIR p ON n.id_periodo = p.id_periodo
        JOIN SECTOR sec ON n.id_sector = sec.id_sector
        WHERE s.estado = 'PENDIENTE'
        ORDER BY s.fecha_solicitud ASC;
END obtener_solicitudes_pendientes;
/