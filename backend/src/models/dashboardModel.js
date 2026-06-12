const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getDashboardData() {
  let connection;

  try {
    connection = await getConnection();

    const [
      sesiones,
      propuestas,
      nombramientosVigentes,
      certificaciones,
      certificacionesVigentes,
      certificacionesAnuladas,
      ultimasCertificaciones,
      ultimosNombramientos,
    ] = await Promise.all([
      connection.execute(`SELECT COUNT(*) AS TOTAL FROM SESION`, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }),

      connection.execute(`SELECT COUNT(*) AS TOTAL FROM PROPUESTA`, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }),

      connection.execute(
        `SELECT COUNT(*) AS TOTAL FROM NOMBRAMIENTO WHERE ESTADO = 'VIGENTE'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(`SELECT COUNT(*) AS TOTAL FROM CERTIFICACION`, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }),

      connection.execute(
        `SELECT COUNT(*) AS TOTAL FROM CERTIFICACION WHERE ESTADO = 'VIGENTE'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `SELECT COUNT(*) AS TOTAL FROM CERTIFICACION WHERE ESTADO = 'ANULADA'`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `
        SELECT *
        FROM (
          SELECT 
            C.ID_CERTIFICACION,
            C.NUMERO_DOCUMENTO,
            TO_CHAR(C.FECHA_EMISION, 'YYYY-MM-DD') AS FECHA_EMISION,
            C.ESTADO,
            A.NOMBRE AS NOMBRE_ASAMBLEISTA,
            N.PUESTO
          FROM CERTIFICACION C
          JOIN NOMBRAMIENTO N ON C.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
          JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
          ORDER BY C.ID_CERTIFICACION DESC
        )
        WHERE ROWNUM <= 5
        `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),

      connection.execute(
        `
        SELECT *
        FROM (
          SELECT
            N.ID_NOMBRAMIENTO,
            A.NOMBRE AS NOMBRE_ASAMBLEISTA,
            S.NOMBRE AS NOMBRE_SECTOR,
            N.PUESTO,
            N.ESTADO,
            TO_CHAR(N.INICIO, 'YYYY-MM-DD') AS INICIO
          FROM NOMBRAMIENTO N
          JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
          JOIN SECTOR S ON N.ID_SECTOR = S.ID_SECTOR
          ORDER BY N.ID_NOMBRAMIENTO DESC
        )
        WHERE ROWNUM <= 5
        `,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      ),
    ]);

    return {
      resumen: {
        sesiones: sesiones.rows[0].TOTAL,
        propuestas: propuestas.rows[0].TOTAL,
        nombramientosVigentes: nombramientosVigentes.rows[0].TOTAL,
        certificaciones: certificaciones.rows[0].TOTAL,
        certificacionesVigentes: certificacionesVigentes.rows[0].TOTAL,
        certificacionesAnuladas: certificacionesAnuladas.rows[0].TOTAL,
      },
      ultimasCertificaciones: ultimasCertificaciones.rows,
      ultimosNombramientos: ultimosNombramientos.rows,
    };
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getDashboardData,
};