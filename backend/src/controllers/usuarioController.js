const { getUsuarios } = require('../models/usuarioModel');

async function listarUsuarios(req, res) {
  try {
    const usuarios = await getUsuarios();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarUsuarios };