const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getNombramientos() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        N.ID_NOMBRAMIENTO,
        N.ID_ASAMBLEISTA,
        N.ID_PERIODO,
        N.ID_SECTOR,
        N.PUESTO,
        N.CONDICION,
        TO_CHAR(N.INICIO, 'YYYY-MM-DD') AS INICIO,
        TO_CHAR(N.FIN, 'YYYY-MM-DD') AS FIN,
        N.ESTADO,
        N.NUM_RESOLUCION,
        A.NOMBRE AS NOMBRE_ASAMBLEISTA,
        S.NOMBRE AS NOMBRE_SECTOR
      FROM NOMBRAMIENTO N
      JOIN ASAMBLEISTA A
        ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
      JOIN SECTOR S
        ON N.ID_SECTOR = S.ID_SECTOR
      ORDER BY N.ID_NOMBRAMIENTO DESC
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function getCatalogosNombramiento() {
  let connection;

  try {
    connection = await getConnection();

    const asambleistas = await connection.execute(
      `
      SELECT
        ID_ASAMBLEISTA,
        NOMBRE
      FROM ASAMBLEISTA
      ORDER BY NOMBRE
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    const sectores = await connection.execute(
      `
      SELECT
        ID_SECTOR,
        NOMBRE
      FROM SECTOR
      ORDER BY NOMBRE
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    const periodos = await connection.execute(
      `
      SELECT
        ID_PERIODO,
        NOMBRE
      FROM PERIODO_AIR
      ORDER BY ID_PERIODO
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return {
      asambleistas: asambleistas.rows,
      sectores: sectores.rows,
      periodos: periodos.rows,
    };
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function getNombramientoById(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        ID_NOMBRAMIENTO,
        ID_ASAMBLEISTA,
        ID_PERIODO,
        ID_SECTOR,
        PUESTO,
        CONDICION,
        TO_CHAR(INICIO, 'YYYY-MM-DD') AS INICIO,
        TO_CHAR(FIN, 'YYYY-MM-DD') AS FIN,
        ESTADO,
        NUM_RESOLUCION
      FROM NOMBRAMIENTO
      WHERE ID_NOMBRAMIENTO = :id
      `,
      [id],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function createNombramiento(data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      INSERT INTO NOMBRAMIENTO (
        ID_ASAMBLEISTA,
        ID_PERIODO,
        ID_SECTOR,
        PUESTO,
        CONDICION,
        INICIO,
        FIN,
        ESTADO,
        NUM_RESOLUCION
      )
      VALUES (
        :id_asambleista,
        :id_periodo,
        :id_sector,
        :puesto,
        :condicion,
        TO_DATE(:inicio, 'YYYY-MM-DD'),
        CASE
          WHEN :fin IS NULL OR :fin = ''
          THEN NULL
          ELSE TO_DATE(:fin, 'YYYY-MM-DD')
        END,
        :estado,
        :num_resolucion
      )
      RETURNING ID_NOMBRAMIENTO INTO :id
      `,
      {
        id_asambleista: Number(data.id_asambleista),
        id_periodo: Number(data.id_periodo),
        id_sector: Number(data.id_sector),
        puesto: String(data.puesto || "").trim(),
        condicion: String(data.condicion || "TITULAR").toUpperCase(),
        inicio: data.inicio,
        fin: data.fin || null,
        estado: String(data.estado || "VIGENTE").toUpperCase(),
        num_resolucion: data.num_resolucion || null,

        id: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_OUT,
        },
      },
      {
        autoCommit: true,
      }
    );

    return result.outBinds.id[0];
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function updateNombramiento(id, data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE NOMBRAMIENTO
      SET
        ID_ASAMBLEISTA = :id_asambleista,
        ID_PERIODO = :id_periodo,
        ID_SECTOR = :id_sector,
        PUESTO = :puesto,
        CONDICION = :condicion,
        INICIO = TO_DATE(:inicio, 'YYYY-MM-DD'),
        FIN = CASE
                WHEN :fin IS NULL OR :fin = ''
                THEN NULL
                ELSE TO_DATE(:fin, 'YYYY-MM-DD')
              END,
        ESTADO = :estado,
        NUM_RESOLUCION = :num_resolucion
      WHERE ID_NOMBRAMIENTO = :id
      `,
      {
        id_asambleista: Number(data.id_asambleista),
        id_periodo: Number(data.id_periodo),
        id_sector: Number(data.id_sector),
        puesto: String(data.puesto || "").trim(),
        condicion: String(data.condicion || "TITULAR").toUpperCase(),
        inicio: data.inicio,
        fin: data.fin || null,
        estado: String(data.estado || "VIGENTE").toUpperCase(),
        num_resolucion: data.num_resolucion || null,
        id: Number(id),
      },
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function deleteNombramiento(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      DELETE FROM NOMBRAMIENTO
      WHERE ID_NOMBRAMIENTO = :id
      `,
      [id],
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } catch (error) {
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getNombramientos,
  getCatalogosNombramiento,
  getNombramientoById,
  createNombramiento,
  updateNombramiento,
  deleteNombramiento,
};