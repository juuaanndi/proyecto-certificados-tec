const {
  getNombramientos,
  getCatalogosNombramiento,
  getNombramientoById,
  createNombramiento,
  updateNombramiento,
  deleteNombramiento,
} = require("../models/nombramientoModel");

async function listarNombramientos(req, res) {
  try {
    const nombramientos = await getNombramientos();
    res.json(nombramientos);
  } catch (error) {
    console.error("Error al listar nombramientos:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
      codigo: error.errorNum || error.code || null,
    });
  }
}

async function listarCatalogosNombramiento(req, res) {
  try {
    const catalogos = await getCatalogosNombramiento();
    res.json(catalogos);
  } catch (error) {
    console.error("Error al listar catálogos de nombramiento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
      codigo: error.errorNum || error.code || null,
    });
  }
}

async function obtenerNombramiento(req, res) {
  try {
    const nombramiento = await getNombramientoById(req.params.id);

    if (!nombramiento) {
      return res.status(404).json({
        error: "Nombramiento no encontrado",
      });
    }

    res.json(nombramiento);
  } catch (error) {
    console.error("Error al obtener nombramiento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
      codigo: error.errorNum || error.code || null,
    });
  }
}

async function crearNombramiento(req, res) {
  try {
    const id = await createNombramiento(req.body);

    res.status(201).json({
      message: "Nombramiento creado correctamente",
      id,
    });
  } catch (error) {
    console.error("Error al crear nombramiento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
      codigo: error.errorNum || error.code || null,
    });
  }
}

async function actualizarNombramiento(req, res) {
  try {
    const rowsAffected = await updateNombramiento(req.params.id, req.body);

    if (!rowsAffected) {
      return res.status(404).json({
        error: "Nombramiento no encontrado",
      });
    }

    res.json({
      message: "Nombramiento actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar nombramiento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
      codigo: error.errorNum || error.code || null,
    });
  }
}

async function eliminarNombramiento(req, res) {
  try {
    const rowsAffected = await deleteNombramiento(req.params.id);

    if (!rowsAffected) {
      return res.status(404).json({
        error: "Nombramiento no encontrado",
      });
    }

    res.json({
      message: "Nombramiento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar nombramiento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
      codigo: error.errorNum || error.code || null,
    });
  }
}

module.exports = {
  listarNombramientos,
  listarCatalogosNombramiento,
  obtenerNombramiento,
  crearNombramiento,
  actualizarNombramiento,
  eliminarNombramiento,
};