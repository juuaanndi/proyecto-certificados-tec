const { getAsambleistas, getAsambleistaById } = require('../models/asambleistaModel');

async function listarAsambleistas(req, res) {
  try {
    const asambleistas = await getAsambleistas();
    res.json(asambleistas);
  } catch (error) {
    console.error('Error al listar asambleistas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerAsambleista(req, res) {
  try {
    const asambleista = await getAsambleistaById(req.params.id);
    if (!asambleista) {
      return res.status(404).json({ error: 'Asambleísta no encontrado' });
    }
    res.json(asambleista);
  } catch (error) {
    console.error('Error al obtener asambleista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarAsambleistas, obtenerAsambleista };