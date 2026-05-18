const { getPropuestas, getPropuestaById, createPropuesta, updatePropuesta, deletePropuesta } = require('../models/propuestaModel');

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

async function crearPropuesta(req, res) {
  try {
    const id = await createPropuesta(req.body);
    res.status(201).json({ message: 'Propuesta creada', id });
  } catch (error) {
    console.error('Error al crear propuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarPropuesta(req, res) {
  try {
    await updatePropuesta(req.params.id, req.body);
    res.json({ message: 'Propuesta actualizada' });
  } catch (error) {
    console.error('Error al actualizar propuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminarPropuesta(req, res) {
  try {
    await deletePropuesta(req.params.id);
    res.json({ message: 'Propuesta eliminada' });
  } catch (error) {
    console.error('Error al eliminar propuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarPropuestas, obtenerPropuesta, crearPropuesta, actualizarPropuesta, eliminarPropuesta };