const express = require('express');
const router = express.Router();
const { listarCertificaciones, obtenerCertificacion } = require('../controllers/certificacionController');

router.get('/', listarCertificaciones);
router.get('/:id', obtenerCertificacion);

module.exports = router;