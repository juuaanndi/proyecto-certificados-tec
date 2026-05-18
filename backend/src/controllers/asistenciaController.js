const { getAsistenciasPorSesion, registrarAsistencia, updateAsistencia } = require('../models/asistenciaModel');

async function listarAsistencia(req, res) {
  try {
    const asistencias = await getAsistenciasPorSesion(req.params.idSesion);
    res.json(asistencias);
  } catch (error) {
    console.error('Error al listar asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function registrar(req, res) {
  try {
    const id = await registrarAsistencia(req.body);
    res.status(201).json({ message: 'Asistencia registrada', id });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizar(req, res) {
  try {
    await updateAsistencia(req.params.id, req.body.asistio);
    res.json({ message: 'Asistencia actualizada' });
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarAsistencia, registrar, actualizar };