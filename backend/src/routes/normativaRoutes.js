const express = require("express");
const router = express.Router();

const {
  listarElementos,
  obtenerElemento,
  crearElemento,
  actualizarElemento,
  nuevaVersion,
  eliminarElemento,
} = require("../controllers/normativaController");

router.get("/", listarElementos);
router.get("/:id", obtenerElemento);
router.post("/", crearElemento);
router.put("/:id", actualizarElemento);
router.post("/:id/nueva-version", nuevaVersion);
router.delete("/:id", eliminarElemento);

module.exports = router;