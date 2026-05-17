const oracledb = require('oracledb');
require('dotenv').config();
const path = require('path');

async function getConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      configDir: path.join(__dirname, 'wallet'),
      walletLocation: path.join(__dirname, 'wallet'),
      walletPassword: process.env.DB_WALLET_PASSWORD,
    });
    return connection;
  } catch (error) {
    console.error('Error conectando a Oracle:', error);
    throw error;
  }
}

module.exports = { getConnection };