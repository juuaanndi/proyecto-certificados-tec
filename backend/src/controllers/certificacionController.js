const {
  getCertificaciones,
  getCatalogosCertificacion,
  createCertificacion,
  updateCertificacion,
  deleteCertificacion,
} = require("../models/certificacionModel");

async function listarCertificaciones(req, res) {
  try {
    const data = await getCertificaciones();
    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function listarCatalogosCertificacion(req, res) {
  try {
    const data = await getCatalogosCertificacion();
    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function crearCertificacion(req, res) {
  try {
    const id = await createCertificacion(req.body);

    res.status(201).json({
      message: "Certificación creada correctamente",
      id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function actualizarCertificacion(req, res) {
  try {
    const rows = await updateCertificacion(
      req.params.id,
      req.body
    );

    if (!rows) {
      return res.status(404).json({
        error: "Certificación no encontrada",
      });
    }

    res.json({
      message: "Certificación actualizada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

async function eliminarCertificacion(req, res) {
  try {
    const rows = await deleteCertificacion(req.params.id);

    if (!rows) {
      return res.status(404).json({
        error: "Certificación no encontrada",
      });
    }

    res.json({
      message: "Certificación eliminada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
}

module.exports = {
  listarCertificaciones,
  listarCatalogosCertificacion,
  crearCertificacion,
  actualizarCertificacion,
  eliminarCertificacion,
};