const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getCertificaciones() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_CERTIFICACION, ID_NOMBRAMIENTO, ID_USUARIO_EMISOR, NUMERO_DOCUMENTO, FECHA_EMISION, ESTADO, DESCRIPCION_MOTIVO_ANULADO FROM CERTIFICACION`,
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

async function getCertificacionById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_CERTIFICACION, ID_NOMBRAMIENTO, ID_USUARIO_EMISOR, NUMERO_DOCUMENTO, FECHA_EMISION, ESTADO, DESCRIPCION_MOTIVO_ANULADO FROM CERTIFICACION WHERE ID_CERTIFICACION = :id`,
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

module.exports = { getCertificaciones, getCertificacionById };