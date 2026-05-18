const { getConnection } = require('../config/db');

async function getUsuarios() {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID_USUARIO, USERNAME, EMAIL, ESTADO FROM USUARIO`,
      [],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { getUsuarios };