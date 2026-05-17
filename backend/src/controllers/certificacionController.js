const { getCertificaciones, getCertificacionById, createCertificacion, updateCertificacion, deleteCertificacion } = require('../models/certificacionModel');

async function listarCertificaciones(req, res) {
  try {
    const certificaciones = await getCertificaciones();
    res.json(certificaciones);
  } catch (error) {
    console.error('Error al listar certificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerCertificacion(req, res) {
  try {
    const certificacion = await getCertificacionById(req.params.id);
    if (!certificacion) {
      return res.status(404).json({ error: 'Certificación no encontrada' });
    }
    res.json(certificacion);
  } catch (error) {
    console.error('Error al obtener certificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crearCertificacion(req, res) {
  try {
    const id = await createCertificacion(req.body);
    res.status(201).json({ message: 'Certificación creada', id });
  } catch (error) {
    console.error('Error al crear certificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarCertificacion(req, res) {
  try {
    await updateCertificacion(req.params.id, req.body);
    res.json({ message: 'Certificación actualizada' });
  } catch (error) {
    console.error('Error al actualizar certificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminarCertificacion(req, res) {
  try {
    await deleteCertificacion(req.params.id);
    res.json({ message: 'Certificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar certificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarCertificaciones, obtenerCertificacion, crearCertificacion, actualizarCertificacion, eliminarCertificacion };