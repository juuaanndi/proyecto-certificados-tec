const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function getNombramientos() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT N.ID_NOMBRAMIENTO, N.ID_ASAMBLEISTA, N.ID_PERIODO, N.ID_SECTOR,
              N.PUESTO, N.CONDICION, N.INICIO, N.FIN, N.ESTADO, N.NUM_RESOLUCION,
              A.NOMBRE AS NOMBRE_ASAMBLEISTA
       FROM NOMBRAMIENTO N
       JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA`,
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

async function getNombramientoById(id) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT N.ID_NOMBRAMIENTO, N.ID_ASAMBLEISTA, N.ID_PERIODO, N.ID_SECTOR,
              N.PUESTO, N.CONDICION, N.INICIO, N.FIN, N.ESTADO, N.NUM_RESOLUCION,
              A.NOMBRE AS NOMBRE_ASAMBLEISTA
       FROM NOMBRAMIENTO N
       JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
       WHERE N.ID_NOMBRAMIENTO = :id`,
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

async function createNombramiento(data) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO NOMBRAMIENTO (ID_ASAMBLEISTA, ID_PERIODO, ID_SECTOR, PUESTO, CONDICION, INICIO, FIN, ESTADO, NUM_RESOLUCION)
       VALUES (:id_asambleista, :id_periodo, :id_sector, :puesto, :condicion, TO_DATE(:inicio, 'YYYY-MM-DD'), TO_DATE(:fin, 'YYYY-MM-DD'), :estado, :num_resolucion)
       RETURNING ID_NOMBRAMIENTO INTO :id`,
      {
        id_asambleista: data.id_asambleista,
        id_periodo: data.id_periodo,
        id_sector: data.id_sector,
        puesto: data.puesto,
        condicion: data.condicion,
        inicio: data.inicio,
        fin: data.fin,
        estado: data.estado || 'ACTIVO',
        num_resolucion: data.num_resolucion || null,
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

async function updateNombramiento(id, data) {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE NOMBRAMIENTO SET PUESTO = :puesto, CONDICION = :condicion, FIN = TO_DATE(:fin, 'YYYY-MM-DD'), ESTADO = :estado, NUM_RESOLUCION = :num_resolucion WHERE ID_NOMBRAMIENTO = :id`,
      { puesto: data.puesto, condicion: data.condicion, fin: data.fin, estado: data.estado, num_resolucion: data.num_resolucion, id },
      { autoCommit: true }
    );
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getNombramientos, getNombramientoById, createNombramiento, updateNombramiento };