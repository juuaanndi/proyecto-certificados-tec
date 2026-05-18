const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getActas() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_ACTA, ID_SESION, URL_DOCUMENTO, QUORUM_INICIO, ESTADO FROM ACTA`,
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

async function getActaById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_ACTA, ID_SESION, URL_DOCUMENTO, QUORUM_INICIO, ESTADO FROM ACTA WHERE ID_ACTA = :id`,
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

module.exports = { getActas, getActaById };