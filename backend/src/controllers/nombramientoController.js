const { getNombramientos, getNombramientoById, createNombramiento, updateNombramiento } = require('../models/nombramientoModel');

async function listarNombramientos(req, res) {
  try {
    const nombramientos = await getNombramientos();
    res.json(nombramientos);
  } catch (error) {
    console.error('Error al listar nombramientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerNombramiento(req, res) {
  try {
    const nombramiento = await getNombramientoById(req.params.id);
    if (!nombramiento) {
      return res.status(404).json({ error: 'Nombramiento no encontrado' });
    }
    res.json(nombramiento);
  } catch (error) {
    console.error('Error al obtener nombramiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crearNombramiento(req, res) {
  try {
    const id = await createNombramiento(req.body);
    res.status(201).json({ message: 'Nombramiento creado', id });
  } catch (error) {
    console.error('Error al crear nombramiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarNombramiento(req, res) {
  try {
    await updateNombramiento(req.params.id, req.body);
    res.json({ message: 'Nombramiento actualizado' });
  } catch (error) {
    console.error('Error al actualizar nombramiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarNombramientos, obtenerNombramiento, crearNombramiento, actualizarNombramiento };