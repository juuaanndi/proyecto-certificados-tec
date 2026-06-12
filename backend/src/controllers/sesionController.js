const { getSesiones, getSesionById, createSesion, updateSesion, deleteSesion } = require('../models/sesionModel');

async function listarSesiones(req, res) {
  try {
    const sesiones = await getSesiones();
    res.json(sesiones);

  } catch (error) {
    console.error('Error al listar sesiones:', error);

    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message,
      codigo: error.code || null
    });
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

async function crearSesion(req, res) {
  try {
    const id = await createSesion(req.body);
    res.status(201).json({ message: 'Sesión creada', id });

  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarSesion(req, res) {
  try {
    await updateSesion(req.params.id, req.body);
    res.json({ message: 'Sesión actualizada' });

  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminarSesion(req, res) {
  try {
    await deleteSesion(req.params.id);
    res.json({ message: 'Sesión eliminada' });

  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  listarSesiones,
  obtenerSesion,
  crearSesion,
  actualizarSesion,
  eliminarSesion
};