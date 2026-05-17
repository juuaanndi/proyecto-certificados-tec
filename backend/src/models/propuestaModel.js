const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getPropuestas() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_PROPUESTA, ID_PERIODO, CODIGO_AIR, TITULO, TIPO, ES_BASE, ID_PROPUESTA_PADRE FROM PROPUESTA`,
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

async function getPropuestaById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_PROPUESTA, ID_PERIODO, CODIGO_AIR, TITULO, TIPO, ES_BASE, ID_PROPUESTA_PADRE FROM PROPUESTA WHERE ID_PROPUESTA = :id`,
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

module.exports = { getPropuestas, getPropuestaById };