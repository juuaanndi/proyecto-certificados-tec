const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getSesiones() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_SESION, ID_PERIODO, NUMERO, FECHA, TIPO, MODALIDAD, QUORUM_MINIMO, QUORUM_INICIO FROM SESION`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function getSesionById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_SESION, ID_PERIODO, NUMERO, FECHA, TIPO, MODALIDAD, QUORUM_MINIMO, QUORUM_INICIO FROM SESION WHERE ID_SESION = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getSesiones, getSesionById };