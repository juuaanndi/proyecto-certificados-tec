const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getArbolNormativa() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_NORMATIVA, ID_PADRE, NIVEL, CODIGO, TITULO, 
              CONTENIDO, ESTADO_VIGENCIA, FECHA_INICIO_VIGENCIA, 
              FECHA_FIN_VIGENCIA, VERSION
       FROM NORMATIVA
       WHERE ESTADO_VIGENCIA = 'VIGENTE'
       ORDER BY NIVEL, CODIGO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return construirArbol(result.rows);
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

function construirArbol(filas) {
  const mapa = {};
  const raices = [];

  filas.forEach(fila => {
    mapa[fila.ID_NORMATIVA] = { ...fila, hijos: [] };
  });

  filas.forEach(fila => {
    if (fila.ID_PADRE) {
      if (mapa[fila.ID_PADRE]) {
        mapa[fila.ID_PADRE].hijos.push(mapa[fila.ID_NORMATIVA]);
      }
    } else {
      raices.push(mapa[fila.ID_NORMATIVA]);
    }
  });

  return raices;
}

async function getNormativaById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_NORMATIVA, ID_PADRE, NIVEL, CODIGO, TITULO,
              CONTENIDO, ESTADO_VIGENCIA, FECHA_INICIO_VIGENCIA,
              FECHA_FIN_VIGENCIA, VERSION
       FROM NORMATIVA WHERE ID_NORMATIVA = :id`,
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

async function createNormativa(data) {
  let connection;
  try {
    connection = await getConnection();

    // Verificar si ya existe una versión vigente con el mismo código
    const existe = await connection.execute(
      `SELECT VERSION FROM NORMATIVA WHERE CODIGO = :codigo AND ESTADO_VIGENCIA = 'VIGENTE'`,
      [data.codigo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const nuevaVersion = existe.rows.length > 0 ? existe.rows[0].VERSION + 1 : 1;

    const result = await connection.execute(
      `INSERT INTO NORMATIVA (ID_PADRE, NIVEL, CODIGO, TITULO, CONTENIDO, VERSION)
       VALUES (:id_padre, :nivel, :codigo, :titulo, :contenido, :version)
       RETURNING ID_NORMATIVA INTO :id`,
      {
        id_padre: data.id_padre || null,
        nivel: data.nivel,
        codigo: data.codigo,
        titulo: data.titulo,
        contenido: data.contenido || null,
        version: nuevaVersion,
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

async function getHistoricoNormativa(codigo) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_NORMATIVA, CODIGO, TITULO, CONTENIDO, ESTADO_VIGENCIA,
              FECHA_INICIO_VIGENCIA, FECHA_FIN_VIGENCIA, VERSION
       FROM NORMATIVA WHERE CODIGO = :codigo ORDER BY VERSION DESC`,
      [codigo],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getArbolNormativa, getNormativaById, createNormativa, getHistoricoNormativa };