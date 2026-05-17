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

async function createPropuesta(data) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO PROPUESTA (ID_PERIODO, CODIGO_AIR, TITULO, TIPO, ES_BASE, ID_PROPUESTA_PADRE)
       VALUES (:id_periodo, :codigo_air, :titulo, :tipo, :es_base, :id_propuesta_padre)
       RETURNING ID_PROPUESTA INTO :id`,
      {
        id_periodo: data.id_periodo,
        codigo_air: data.codigo_air,
        titulo: data.titulo,
        tipo: data.tipo,
        es_base: data.es_base,
        id_propuesta_padre: data.id_propuesta_padre || null,
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

async function updatePropuesta(id, data) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE PROPUESTA SET CODIGO_AIR = :codigo_air, TITULO = :titulo, TIPO = :tipo, ES_BASE = :es_base, ID_PROPUESTA_PADRE = :id_propuesta_padre WHERE ID_PROPUESTA = :id`,
      { ...data, id },
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function deletePropuesta(id) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `DELETE FROM PROPUESTA WHERE ID_PROPUESTA = :id`,
      [id],
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getPropuestas, getPropuestaById, createPropuesta, updatePropuesta, deletePropuesta };