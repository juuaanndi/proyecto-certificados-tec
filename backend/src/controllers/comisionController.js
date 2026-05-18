const { getComisiones, getComisionById } = require('../models/comisionModel');

async function listarComisiones(req, res) {
  try {
    const comisiones = await getComisiones();
    res.json(comisiones);
  } catch (error) {
    console.error('Error al listar comisiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerComision(req, res) {
  try {
    const comision = await getComisionById(req.params.id);
    if (!comision) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }
    res.json(comision);
  } catch (error) {
    console.error('Error al obtener comisión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarComisiones, obtenerComision };