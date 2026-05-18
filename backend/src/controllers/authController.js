const admin = require('../config/firebase');

async function login(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({
      message: 'Login exitoso',
      uid: decodedToken.uid,
      email: decodedToken.email
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}

async function logout(req, res) {
  try {
    await admin.auth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
}

module.exports = { login, logout };