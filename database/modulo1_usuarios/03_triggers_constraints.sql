-- ========================
-- MÓDULO 1: TRIGGERS Y CONSTRAINTS ADICIONALES
-- ========================

-- Constraint fecha_fin > fecha_inicio en nombramientos
ALTER TABLE NOMBRAMIENTO 
ADD CONSTRAINT chk_nombramiento_fechas 
CHECK (fin IS NULL OR fin > inicio);

-- Índice único para solo 1 nombramiento vigente por asambleísta/sector/período
CREATE UNIQUE INDEX uq_nombramiento_vigente
ON NOMBRAMIENTO (
    id_asambleista,
    id_sector,
    id_periodo,
    CASE WHEN estado = 'VIGENTE' THEN 'VIGENTE' ELSE NULL END
);

-- Trigger de auditoría para NOMBRAMIENTO
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

-- SP para validación de fechas en nombramientos
CREATE OR REPLACE PROCEDURE validar_nombramiento_fechas(
    p_id_asambleista IN NUMBER,
    p_id_sector      IN NUMBER,
    p_id_periodo     IN NUMBER,
    p_inicio         IN DATE,
    p_fin            IN DATE
) AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM NOMBRAMIENTO
    WHERE id_asambleista = p_id_asambleista
    AND id_sector = p_id_sector
    AND id_periodo = p_id_periodo
    AND estado = 'VIGENTE'
    AND (
        p_fin IS NULL
        OR (inicio <= NVL(p_fin, DATE '9999-12-31')
        AND NVL(fin, DATE '9999-12-31') >= p_inicio)
    );

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 
            'El asambleísta ya tiene un nombramiento activo en este sector y período que se traslapa.');
    END IF;
END validar_nombramiento_fechas;
/