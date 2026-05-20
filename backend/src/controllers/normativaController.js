const {
  getElementosNormativos,
  getElementoNormativoById,
  createElementoNormativo,
  updateElementoNormativo,
  publicarNuevaVersion,
  deleteElementoNormativo,
} = require("../models/normativaModel");

async function listarElementos(req, res) {
  try {
    const elementos = await getElementosNormativos();
    res.json(elementos);
  } catch (error) {
    console.error("Error listando normativa:", error);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

async function obtenerElemento(req, res) {
  try {
    const elemento = await getElementoNormativoById(req.params.id);

    if (!elemento) {
      return res.status(404).json({
        error: "Elemento normativo no encontrado",
      });
    }

    res.json(elemento);
  } catch (error) {
    console.error("Error obteniendo elemento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

async function crearElemento(req, res) {
  try {
    const id = await createElementoNormativo(req.body);

    res.status(201).json({
      message: "Elemento normativo creado correctamente",
      id,
    });
  } catch (error) {
    console.error("Error creando elemento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

async function actualizarElemento(req, res) {
  try {
    await updateElementoNormativo(req.params.id, req.body);

    res.json({
      message: "Elemento normativo actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando elemento:", error);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

async function nuevaVersion(req, res) {
  try {
    const nuevoId = await publicarNuevaVersion(
      req.params.id,
      req.body
    );

    if (!nuevoId) {
      return res.status(404).json({
        error: "Elemento normativo no encontrado",
      });
    }

    res.json({
      message: "Nueva versión publicada correctamente",
      nuevoId,
    });
  } catch (error) {
    console.error("Error publicando nueva versión:", error);

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

async function eliminarElemento(req, res) {
  try {
    await deleteElementoNormativo(req.params.id);

    res.json({
      message: "Elemento normativo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando elemento:", error);

    if (error.code === "TIENE_HIJOS") {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

module.exports = {
  listarElementos,
  obtenerElemento,
  crearElemento,
  actualizarElemento,
  nuevaVersion,
  eliminarElemento,
};