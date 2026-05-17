const express = require('express');
const router = express.Router();
const { listarCertificaciones, obtenerCertificacion, crearCertificacion, actualizarCertificacion, eliminarCertificacion } = require('../controllers/certificacionController');

router.get('/', listarCertificaciones);
router.get('/:id', obtenerCertificacion);
router.post('/', crearCertificacion);
router.put('/:id', actualizarCertificacion);
router.delete('/:id', eliminarCertificacion);

module.exports = router;