const { getPropuestas, getPropuestaById } = require('../models/propuestaModel');

async function listarPropuestas(req, res) {
  try {
    const propuestas = await getPropuestas();
    res.json(propuestas);
  } catch (error) {
    console.error('Error al listar propuestas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerPropuesta(req, res) {
  try {
    const propuesta = await getPropuestaById(req.params.id);
    if (!propuesta) {
      return res.status(404).json({ error: 'Propuesta no encontrada' });
    }
    res.json(propuesta);
  } catch (error) {
    console.error('Error al obtener propuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarPropuestas, obtenerPropuesta };