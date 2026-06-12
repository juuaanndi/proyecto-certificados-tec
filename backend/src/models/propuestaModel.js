const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getPropuestas() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        ID_PROPUESTA,
        ID_PERIODO,
        CODIGO_AIR,
        TITULO,
        TIPO,
        ES_BASE,
        ID_PROPUESTA_PADRE
      FROM PROPUESTA
      ORDER BY ID_PROPUESTA DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
}

async function getPropuestaById(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT
        ID_PROPUESTA,
        ID_PERIODO,
        CODIGO_AIR,
        TITULO,
        TIPO,
        ES_BASE,
        ID_PROPUESTA_PADRE
      FROM PROPUESTA
      WHERE ID_PROPUESTA = :id`,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0];
  } finally {
    if (connection) await connection.close();
  }
}

async function createPropuesta(data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO PROPUESTA (
        ID_PERIODO,
        CODIGO_AIR,
        TITULO,
        TIPO,
        ES_BASE,
        ID_PROPUESTA_PADRE
      )
      VALUES (
        :id_periodo,
        :codigo_air,
        :titulo,
        :tipo,
        :es_base,
        :id_propuesta_padre
      )
      RETURNING ID_PROPUESTA INTO :id`,
      {
        id_periodo: Number(data.id_periodo || 1),
        codigo_air: String(data.codigo_air || "").trim(),
        titulo: String(data.titulo || "").trim(),
        tipo: String(data.tipo || "BASE").toUpperCase(),
        es_base: Number(data.es_base),
        id_propuesta_padre:
          data.id_propuesta_padre === "" ||
          data.id_propuesta_padre === null ||
          data.id_propuesta_padre === undefined
            ? null
            : Number(data.id_propuesta_padre),
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      },
      { autoCommit: true }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

async function updatePropuesta(id, data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE PROPUESTA
      SET
        ID_PERIODO = :id_periodo,
        CODIGO_AIR = :codigo_air,
        TITULO = :titulo,
        TIPO = :tipo,
        ES_BASE = :es_base,
        ID_PROPUESTA_PADRE = :id_propuesta_padre
      WHERE ID_PROPUESTA = :id`,
      {
        id: Number(id),
        id_periodo: Number(data.id_periodo || 1),
        codigo_air: String(data.codigo_air || "").trim(),
        titulo: String(data.titulo || "").trim(),
        tipo: String(data.tipo || "BASE").toUpperCase(),
        es_base: Number(data.es_base),
        id_propuesta_padre:
          data.id_propuesta_padre === "" ||
          data.id_propuesta_padre === null ||
          data.id_propuesta_padre === undefined
            ? null
            : Number(data.id_propuesta_padre),
      },
      { autoCommit: true }
    );

    return result.rowsAffected;
  } finally {
    if (connection) await connection.close();
  }
}

async function deletePropuesta(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM PROPUESTA
      WHERE ID_PROPUESTA = :id`,
      { id: Number(id) },
      { autoCommit: true }
    );

    return result.rowsAffected;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getPropuestas,
  getPropuestaById,
  createPropuesta,
  updatePropuesta,
  deletePropuesta,
};