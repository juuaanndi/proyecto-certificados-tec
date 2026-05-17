-- ========================
-- MÓDULO 1: NORMATIVA RECURSIVA
-- ========================

-- Tabla ELEMENTO_NORMATIVO (recursiva)
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

-- Trigger de vigencia: marca anterior como HISTORICA al insertar nueva versión
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

-- Trigger de auditoría para ELEMENTO_NORMATIVO
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