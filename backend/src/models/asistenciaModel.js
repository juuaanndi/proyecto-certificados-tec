const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getAsistenciasPorSesion(idSesion) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        A.ID_ASISTENCIA,
        N.ID_NOMBRAMIENTO,
        :idSesion AS ID_SESION,
        NVL(A.ASISTIO, 0) AS ASISTIO,
        ASM.NOMBRE AS NOMBRE_ASAMBLEISTA,
        N.ID_SECTOR AS SECTOR,
        N.PUESTO
      FROM NOMBRAMIENTO N
      JOIN ASAMBLEISTA ASM
        ON N.ID_ASAMBLEISTA = ASM.ID_ASAMBLEISTA
      LEFT JOIN ASISTENCIA A
        ON A.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
       AND A.ID_SESION = :idSesion
      WHERE N.ESTADO = 'VIGENTE'
      ORDER BY ASM.NOMBRE, N.ID_NOMBRAMIENTO
      `,
      {
        idSesion: Number(idSesion),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function registrarAsistencia(data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      INSERT INTO ASISTENCIA (
        ID_NOMBRAMIENTO,
        ID_SESION,
        ASISTIO
      )
      VALUES (
        :id_nombramiento,
        :id_sesion,
        :asistio
      )
      RETURNING ID_ASISTENCIA INTO :id
      `,
      {
        id_nombramiento: Number(data.id_nombramiento),
        id_sesion: Number(data.id_sesion),
        asistio: Number(data.asistio),
        id: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_OUT,
        },
      },
      {
        autoCommit: true,
      }
    );

    return result.outBinds.id[0];
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function updateAsistencia(id, asistio) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE ASISTENCIA
      SET ASISTIO = :asistio
      WHERE ID_ASISTENCIA = :id
      `,
      {
        asistio: Number(asistio),
        id: Number(id),
      },
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getAsistenciasPorSesion,
  registrarAsistencia,
  updateAsistencia,
};