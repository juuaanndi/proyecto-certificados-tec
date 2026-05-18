const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getAsistenciasPorSesion(idSesion) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT A.ID_ASISTENCIA, A.ID_NOMBRAMIENTO, A.ID_SESION, A.ASISTIO,
              AS2.NOMBRE AS NOMBRE_ASAMBLEISTA
       FROM ASISTENCIA A
       JOIN NOMBRAMIENTO N ON A.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
       JOIN ASAMBLEISTA AS2 ON N.ID_ASAMBLEISTA = AS2.ID_ASAMBLEISTA
       WHERE A.ID_SESION = :idSesion`,
      [idSesion],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function registrarAsistencia(data) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO ASISTENCIA (ID_NOMBRAMIENTO, ID_SESION, ASISTIO)
       VALUES (:id_nombramiento, :id_sesion, :asistio)
       RETURNING ID_ASISTENCIA INTO :id`,
      {
        id_nombramiento: data.id_nombramiento,
        id_sesion: data.id_sesion,
        asistio: data.asistio,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );
    return result.outBinds.id[0];
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function updateAsistencia(id, asistio) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE ASISTENCIA SET ASISTIO = :asistio WHERE ID_ASISTENCIA = :id`,
      { asistio, id },
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getAsistenciasPorSesion, registrarAsistencia, updateAsistencia };