const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

async function getCertificaciones() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        C.ID_CERTIFICACION,
        C.ID_NOMBRAMIENTO,
        C.ID_USUARIO_EMISOR,
        C.NUMERO_DOCUMENTO,
        C.FECHA_EMISION,
        C.ESTADO,
        C.DESCRIPCION_MOTIVO_ANULADO,
        N.PUESTO,
        A.NOMBRE AS NOMBRE_ASAMBLEISTA,
        U.USERNAME AS USUARIO_EMISOR
      FROM CERTIFICACION C
      JOIN NOMBRAMIENTO N
        ON C.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
      JOIN ASAMBLEISTA A
        ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
      JOIN USUARIO U
        ON C.ID_USUARIO_EMISOR = U.ID_USUARIO
      ORDER BY C.ID_CERTIFICACION DESC
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
}

async function getCatalogosCertificacion() {
  let connection;

  try {
    connection = await getConnection();

    const nombramientos = await connection.execute(
      `
      SELECT
        N.ID_NOMBRAMIENTO,
        A.NOMBRE || ' - ' || N.PUESTO AS NOMBRE
      FROM NOMBRAMIENTO N
      JOIN ASAMBLEISTA A
        ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
      WHERE N.ESTADO = 'VIGENTE'
      ORDER BY A.NOMBRE
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    const usuarios = await connection.execute(
      `
      SELECT
        ID_USUARIO,
        USERNAME
      FROM USUARIO
      WHERE ESTADO = 'ACTIVO'
      ORDER BY USERNAME
      `,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return {
      nombramientos: nombramientos.rows,
      usuarios: usuarios.rows,
      estados: ["VIGENTE", "ANULADA"],
    };
  } finally {
    if (connection) await connection.close();
  }
}

async function createCertificacion(data) {
  let connection;

  try {
    connection = await getConnection();

    const snapshot = JSON.stringify({
      nombramiento: data.id_nombramiento,
      usuario_emisor: data.id_usuario_emisor,
      fecha: data.fecha_emision,
    });

    const result = await connection.execute(
      `
      INSERT INTO CERTIFICACION (
        ID_NOMBRAMIENTO,
        ID_USUARIO_EMISOR,
        NUMERO_DOCUMENTO,
        FECHA_EMISION,
        SNAPSHOT,
        ESTADO,
        DESCRIPCION_MOTIVO_ANULADO
      )
      VALUES (
        :id_nombramiento,
        :id_usuario_emisor,
        :numero_documento,
        TO_DATE(:fecha_emision, 'YYYY-MM-DD'),
        :snapshot,
        :estado,
        :descripcion_motivo_anulado
      )
      RETURNING ID_CERTIFICACION INTO :id
      `,
      {
        id_nombramiento: data.id_nombramiento,
        id_usuario_emisor: data.id_usuario_emisor,
        numero_documento: data.numero_documento,
        fecha_emision: data.fecha_emision,
        snapshot,
        estado: data.estado,
        descripcion_motivo_anulado:
          data.descripcion_motivo_anulado || null,

        id: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      {
        autoCommit: true,
      }
    );

    return result.outBinds.id[0];
  } finally {
    if (connection) await connection.close();
  }
}

async function updateCertificacion(id, data) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE CERTIFICACION
      SET
        ESTADO = :estado,
        DESCRIPCION_MOTIVO_ANULADO = :descripcion_motivo_anulado
      WHERE ID_CERTIFICACION = :id
      `,
      {
        estado: data.estado,
        descripcion_motivo_anulado:
          data.descripcion_motivo_anulado || null,
        id,
      },
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteCertificacion(id) {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      DELETE FROM CERTIFICACION
      WHERE ID_CERTIFICACION = :id
      `,
      [id],
      {
        autoCommit: true,
      }
    );

    return result.rowsAffected;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getCertificaciones,
  getCatalogosCertificacion,
  createCertificacion,
  updateCertificacion,
  deleteCertificacion,
};