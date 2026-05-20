const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getElementosNormativos() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        ID_ELEMENTO,
        ID_PADRE,
        TIPO,
        TITULO,
        CONTENIDO,
        ORDEN,
        ESTADO_VIGENCIA,
        TO_CHAR(FECHA_INICIO_VIGENCIA, 'YYYY-MM-DD') AS FECHA_INICIO_VIGENCIA,
        TO_CHAR(FECHA_FIN_VIGENCIA, 'YYYY-MM-DD') AS FECHA_FIN_VIGENCIA,
        ORIGEN
      FROM ELEMENTO_NORMATIVO
      ORDER BY
        NVL(ID_PADRE, 0),
        NVL(ORDEN, 0),
        ID_ELEMENTO
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function getElementoNormativoById(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        ID_ELEMENTO,
        ID_PADRE,
        TIPO,
        TITULO,
        CONTENIDO,
        ORDEN,
        ESTADO_VIGENCIA,
        TO_CHAR(FECHA_INICIO_VIGENCIA, 'YYYY-MM-DD') AS FECHA_INICIO_VIGENCIA,
        TO_CHAR(FECHA_FIN_VIGENCIA, 'YYYY-MM-DD') AS FECHA_FIN_VIGENCIA,
        ORIGEN
      FROM ELEMENTO_NORMATIVO
      WHERE ID_ELEMENTO = :id
      `,
      {
        id: Number(id),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows[0];
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function createElementoNormativo(data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      INSERT INTO ELEMENTO_NORMATIVO (
        ID_PADRE,
        TIPO,
        TITULO,
        CONTENIDO,
        ORDEN,
        ESTADO_VIGENCIA,
        FECHA_INICIO_VIGENCIA,
        FECHA_FIN_VIGENCIA,
        ORIGEN
      )
      VALUES (
        :id_padre,
        :tipo,
        :titulo,
        :contenido,
        :orden,
        :estado_vigencia,
        TO_DATE(:fecha_inicio_vigencia, 'YYYY-MM-DD'),
        CASE
          WHEN :fecha_fin_vigencia IS NULL OR :fecha_fin_vigencia = ''
          THEN NULL
          ELSE TO_DATE(:fecha_fin_vigencia, 'YYYY-MM-DD')
        END,
        :origen
      )
      RETURNING ID_ELEMENTO INTO :id
      `,
      {
        id_padre:
          data.id_padre === "" ||
          data.id_padre === null ||
          data.id_padre === undefined
            ? null
            : Number(data.id_padre),
        tipo: String(data.tipo || "").toUpperCase(),
        titulo: data.titulo || null,
        contenido: data.contenido || null,
        orden:
          data.orden === "" || data.orden === null || data.orden === undefined
            ? null
            : Number(data.orden),
        estado_vigencia: String(data.estado_vigencia || "VIGENTE").toUpperCase(),
        fecha_inicio_vigencia: data.fecha_inicio_vigencia,
        fecha_fin_vigencia: data.fecha_fin_vigencia || null,
        origen: data.origen || null,
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
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function updateElementoNormativo(id, data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE ELEMENTO_NORMATIVO
      SET
        ID_PADRE = :id_padre,
        TIPO = :tipo,
        TITULO = :titulo,
        CONTENIDO = :contenido,
        ORDEN = :orden,
        ESTADO_VIGENCIA = :estado_vigencia,
        FECHA_INICIO_VIGENCIA = TO_DATE(:fecha_inicio_vigencia, 'YYYY-MM-DD'),
        FECHA_FIN_VIGENCIA =
          CASE
            WHEN :fecha_fin_vigencia IS NULL OR :fecha_fin_vigencia = ''
            THEN NULL
            ELSE TO_DATE(:fecha_fin_vigencia, 'YYYY-MM-DD')
          END,
        ORIGEN = :origen
      WHERE ID_ELEMENTO = :id
      `,
      {
        id: Number(id),
        id_padre:
          data.id_padre === "" ||
          data.id_padre === null ||
          data.id_padre === undefined
            ? null
            : Number(data.id_padre),
        tipo: String(data.tipo || "").toUpperCase(),
        titulo: data.titulo || null,
        contenido: data.contenido || null,
        orden:
          data.orden === "" || data.orden === null || data.orden === undefined
            ? null
            : Number(data.orden),
        estado_vigencia: String(data.estado_vigencia || "VIGENTE").toUpperCase(),
        fecha_inicio_vigencia: data.fecha_inicio_vigencia,
        fecha_fin_vigencia: data.fecha_fin_vigencia || null,
        origen: data.origen || null,
      },
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function publicarNuevaVersion(id, data) {
  let connection;

  try {
    connection = await getConnection();

    const actual = await connection.execute(
      `
      SELECT
        ID_ELEMENTO,
        ID_PADRE,
        TIPO,
        TITULO,
        ORDEN,
        ORIGEN
      FROM ELEMENTO_NORMATIVO
      WHERE ID_ELEMENTO = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const elementoActual = actual.rows[0];

    if (!elementoActual) {
      return null;
    }

    await connection.execute(
      `
      UPDATE ELEMENTO_NORMATIVO
      SET
        ESTADO_VIGENCIA = 'HISTORICA',
        FECHA_FIN_VIGENCIA = SYSDATE
      WHERE ID_ELEMENTO = :id
      `,
      { id: Number(id) }
    );

    const result = await connection.execute(
      `
      INSERT INTO ELEMENTO_NORMATIVO (
        ID_PADRE,
        TIPO,
        TITULO,
        CONTENIDO,
        ORDEN,
        ESTADO_VIGENCIA,
        FECHA_INICIO_VIGENCIA,
        FECHA_FIN_VIGENCIA,
        ORIGEN
      )
      VALUES (
        :id_padre,
        :tipo,
        :titulo,
        :contenido,
        :orden,
        'VIGENTE',
        TO_DATE(:fecha_inicio_vigencia, 'YYYY-MM-DD'),
        NULL,
        :origen
      )
      RETURNING ID_ELEMENTO INTO :nuevo_id
      `,
      {
        id_padre: elementoActual.ID_PADRE,
        tipo: elementoActual.TIPO,
        titulo: data.titulo || elementoActual.TITULO,
        contenido: data.contenido || null,
        orden: elementoActual.ORDEN,
        fecha_inicio_vigencia: data.fecha_inicio_vigencia,
        origen: data.origen || elementoActual.ORIGEN || "Nueva versión",
        nuevo_id: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_OUT,
        },
      }
    );

    await connection.commit();

    return result.outBinds.nuevo_id[0];
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function deleteElementoNormativo(id) {
  let connection;

  try {
    connection = await getConnection();

    const hijos = await connection.execute(
      `
      SELECT COUNT(*) AS TOTAL
      FROM ELEMENTO_NORMATIVO
      WHERE ID_PADRE = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (hijos.rows[0].TOTAL > 0) {
      const error = new Error(
        "No se puede eliminar este elemento porque tiene elementos hijos asociados."
      );
      error.code = "TIENE_HIJOS";
      throw error;
    }

    const result = await connection.execute(
      `
      DELETE FROM ELEMENTO_NORMATIVO
      WHERE ID_ELEMENTO = :id
      `,
      { id: Number(id) },
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getElementosNormativos,
  getElementoNormativoById,
  createElementoNormativo,
  updateElementoNormativo,
  publicarNuevaVersion,
  deleteElementoNormativo,
};