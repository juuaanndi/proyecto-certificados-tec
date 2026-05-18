const { getActas, getActaById } = require('../models/actaModel');

async function listarActas(req, res) {
  try {
    const actas = await getActas();
    res.json(actas);
  } catch (error) {
    console.error('Error al listar actas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerActa(req, res) {
  try {
    const acta = await getActaById(req.params.id);
    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }
    res.json(acta);
  } catch (error) {
    console.error('Error al obtener acta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarActas, obtenerActa };