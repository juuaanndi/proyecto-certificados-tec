const express = require("express");
const router = express.Router();

const {
  listarCertificaciones,
  listarCatalogosCertificacion,
  crearCertificacion,
  actualizarCertificacion,
  eliminarCertificacion,
} = require("../controllers/certificacionController");

router.get("/", listarCertificaciones);

router.get(
  "/catalogos",
  listarCatalogosCertificacion
);

router.post("/", crearCertificacion);

router.put("/:id", actualizarCertificacion);

router.delete("/:id", eliminarCertificacion);

module.exports = router;