const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getResoluciones() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT R.ID_RESOLUCION, R.ID_PROPUESTA, R.ID_SESION, R.FECHA_EMISION,
              R.NUMERO_RESOLUCION, R.TEXTO_DEL_RESULTADO, R.FUNDAMENTA, R.CONSIDERANDO,
              P.TITULO AS TITULO_PROPUESTA
       FROM RESOLUCION R
       JOIN PROPUESTA P ON R.ID_PROPUESTA = P.ID_PROPUESTA`,
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

async function getResolucionById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT R.ID_RESOLUCION, R.ID_PROPUESTA, R.ID_SESION, R.FECHA_EMISION,
              R.NUMERO_RESOLUCION, R.TEXTO_DEL_RESULTADO, R.FUNDAMENTA, R.CONSIDERANDO,
              P.TITULO AS TITULO_PROPUESTA
       FROM RESOLUCION R
       JOIN PROPUESTA P ON R.ID_PROPUESTA = P.ID_PROPUESTA
       WHERE R.ID_RESOLUCION = :id`,
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

async function createResolucion(data) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO RESOLUCION (ID_PROPUESTA, ID_SESION, FECHA_EMISION, NUMERO_RESOLUCION, TEXTO_DEL_RESULTADO, FUNDAMENTA, CONSIDERANDO)
       VALUES (:id_propuesta, :id_sesion, TO_DATE(:fecha_emision, 'YYYY-MM-DD'), :numero_resolucion, :texto_del_resultado, :fundamenta, :considerando)
       RETURNING ID_RESOLUCION INTO :id`,
      {
        id_propuesta: data.id_propuesta,
        id_sesion: data.id_sesion,
        fecha_emision: data.fecha_emision,
        numero_resolucion: data.numero_resolucion,
        texto_del_resultado: data.texto_del_resultado,
        fundamenta: data.fundamenta || null,
        considerando: data.considerando || null,
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

async function updateResolucion(id, data) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE RESOLUCION SET TEXTO_DEL_RESULTADO = :texto_del_resultado, FUNDAMENTA = :fundamenta, CONSIDERANDO = :considerando WHERE ID_RESOLUCION = :id`,
      { texto_del_resultado: data.texto_del_resultado, fundamenta: data.fundamenta, considerando: data.considerando, id },
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getResoluciones, getResolucionById, createResolucion, updateResolucion };