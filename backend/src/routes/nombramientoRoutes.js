const express = require("express");
const router = express.Router();

const {
  listarNombramientos,
  listarCatalogosNombramiento,
  obtenerNombramiento,
  crearNombramiento,
  actualizarNombramiento,
  eliminarNombramiento,
} = require("../controllers/nombramientoController");

const { validarNombramiento } = require("../middlewares/validacionMiddleware");

router.get("/", listarNombramientos);

/*
  IMPORTANTE:
  Esta ruta debe ir ANTES de router.get("/:id"),
  porque si no Express interpreta "catalogos" como si fuera un ID.
*/
router.get("/catalogos", listarCatalogosNombramiento);

router.get("/:id", obtenerNombramiento);
router.post("/", validarNombramiento, crearNombramiento);
router.put("/:id", validarNombramiento, actualizarNombramiento);
router.delete("/:id", eliminarNombramiento);

module.exports = router;