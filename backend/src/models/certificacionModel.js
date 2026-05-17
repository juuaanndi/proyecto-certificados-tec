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

async function createCertificacion(data) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO CERTIFICACION (ID_NOMBRAMIENTO, ID_USUARIO_EMISOR, NUMERO_DOCUMENTO, FECHA_EMISION, ESTADO, DESCRIPCION_MOTIVO_ANULADO)
       VALUES (:id_nombramiento, :id_usuario_emisor, :numero_documento, TO_DATE(:fecha_emision, 'YYYY-MM-DD'), :estado, :descripcion_motivo_anulado)
       RETURNING ID_CERTIFICACION INTO :id`,
      {
        id_nombramiento: data.id_nombramiento,
        id_usuario_emisor: data.id_usuario_emisor,
        numero_documento: data.numero_documento,
        fecha_emision: data.fecha_emision,
        estado: data.estado || 'ACTIVO',
        descripcion_motivo_anulado: data.descripcion_motivo_anulado || null,
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

async function updateCertificacion(id, data) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE CERTIFICACION SET ESTADO = :estado, DESCRIPCION_MOTIVO_ANULADO = :descripcion_motivo_anulado WHERE ID_CERTIFICACION = :id`,
      { estado: data.estado, descripcion_motivo_anulado: data.descripcion_motivo_anulado, id },
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteCertificacion(id) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `DELETE FROM CERTIFICACION WHERE ID_CERTIFICACION = :id`,
      [id],
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getCertificaciones, getCertificacionById, createCertificacion, updateCertificacion, deleteCertificacion };