const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getAsambleistas() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_ASAMBLEISTA, NOMBRE, CEDULA, CORREO, ID_USUARIO FROM ASAMBLEISTA`,
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

async function getAsambleistaById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_ASAMBLEISTA, NOMBRE, CEDULA, CORREO, ID_USUARIO FROM ASAMBLEISTA WHERE ID_ASAMBLEISTA = :id`,
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

module.exports = { getAsambleistas, getAsambleistaById };