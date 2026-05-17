const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getComisiones() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_COMISION, ID_PERIODO, NOMBRE, INICIO, FIN, ROL FROM COMISION_TRABAJO`,
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

async function getComisionById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_COMISION, ID_PERIODO, NOMBRE, INICIO, FIN, ROL FROM COMISION_TRABAJO WHERE ID_COMISION = :id`,
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

module.exports = { getComisiones, getComisionById };