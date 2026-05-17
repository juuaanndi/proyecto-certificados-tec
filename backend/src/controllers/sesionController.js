const { getSesiones, getSesionById } = require('../models/sesionModel');

async function listarSesiones(req, res) {
  try {
    const sesiones = await getSesiones();
    res.json(sesiones);
  } catch (error) {
    console.error('Error al listar sesiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerSesion(req, res) {
  try {
    const sesion = await getSesionById(req.params.id);
    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    res.json(sesion);
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarSesiones, obtenerSesion };