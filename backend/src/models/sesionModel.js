const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getSesiones() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
        ID_SESION, 
        ID_PERIODO, 
        NUMERO, 
        FECHA, 
        TIPO, 
        MODALIDAD, 
        QUORUM_MINIMO, 
        QUORUM_INICIO
      FROM SESION
      ORDER BY ID_SESION DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
}

async function getSesionById(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
        ID_SESION, 
        ID_PERIODO, 
        NUMERO, 
        FECHA, 
        TIPO, 
        MODALIDAD, 
        QUORUM_MINIMO, 
        QUORUM_INICIO
      FROM SESION
      WHERE ID_SESION = :id`,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0];
  } finally {
    if (connection) await connection.close();
  }
}

async function createSesion(data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO SESION (
        ID_PERIODO, 
        NUMERO, 
        FECHA, 
        TIPO, 
        MODALIDAD, 
        QUORUM_MINIMO, 
        QUORUM_INICIO
      )
      VALUES (
        :id_periodo, 
        :numero, 
        TO_DATE(:fecha, 'YYYY-MM-DD'), 
        :tipo, 
        :modalidad, 
        :quorum_minimo, 
        :quorum_inicio
      )
      RETURNING ID_SESION INTO :id`,
      {
        id_periodo: Number(data.id_periodo || 1),
        numero: data.numero,
        fecha: data.fecha,
        tipo: String(data.tipo).toUpperCase(),
        modalidad: String(data.modalidad).toUpperCase(),
        quorum_minimo: Number(data.quorum_minimo),
        quorum_inicio: Number(data.quorum_inicio),
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      },
      { autoCommit: true }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

async function updateSesion(id, data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE SESION
      SET 
        ID_PERIODO = :id_periodo,
        NUMERO = :numero,
        FECHA = TO_DATE(:fecha, 'YYYY-MM-DD'),
        TIPO = :tipo,
        MODALIDAD = :modalidad,
        QUORUM_MINIMO = :quorum_minimo,
        QUORUM_INICIO = :quorum_inicio
      WHERE ID_SESION = :id`,
      {
        id: Number(id),
        id_periodo: Number(data.id_periodo || 1),
        numero: data.numero,
        fecha: data.fecha,
        tipo: String(data.tipo).toUpperCase(),
        modalidad: String(data.modalidad).toUpperCase(),
        quorum_minimo: Number(data.quorum_minimo),
        quorum_inicio: Number(data.quorum_inicio),
      },
      { autoCommit: true }
    );

    return result.rowsAffected;
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteSesion(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `DELETE FROM SESION
      WHERE ID_SESION = :id`,
      { id: Number(id) },
      { autoCommit: true }
    );

    return result.rowsAffected;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getSesiones,
  getSesionById,
  createSesion,
  updateSesion,
  deleteSesion,
};