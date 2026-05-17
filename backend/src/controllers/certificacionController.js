const { getCertificaciones, getCertificacionById } = require('../models/certificacionModel');

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

module.exports = { listarCertificaciones, obtenerCertificacion };