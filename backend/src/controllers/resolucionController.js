const { getResoluciones, getResolucionById, createResolucion, updateResolucion } = require('../models/resolucionModel');

async function listarResoluciones(req, res) {
  try {
    const resoluciones = await getResoluciones();
    res.json(resoluciones);
  } catch (error) {
    console.error('Error al listar resoluciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerResolucion(req, res) {
  try {
    const resolucion = await getResolucionById(req.params.id);
    if (!resolucion) {
      return res.status(404).json({ error: 'Resolución no encontrada' });
    }
    res.json(resolucion);
  } catch (error) {
    console.error('Error al obtener resolución:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crearResolucion(req, res) {
  try {
    const id = await createResolucion(req.body);
    res.status(201).json({ message: 'Resolución creada', id });
  } catch (error) {
    console.error('Error al crear resolución:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarResolucion(req, res) {
  try {
    await updateResolucion(req.params.id, req.body);
    res.json({ message: 'Resolución actualizada' });
  } catch (error) {
    console.error('Error al actualizar resolución:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarResoluciones, obtenerResolucion, crearResolucion, actualizarResolucion };