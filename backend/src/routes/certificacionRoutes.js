const express = require('express');
const router = express.Router();
const { listarCertificaciones, obtenerCertificacion, crearCertificacion, actualizarCertificacion, eliminarCertificacion } = require('../controllers/certificacionController');
const { validarCertificacion } = require('../middlewares/validacionMiddleware');

router.get('/', listarCertificaciones);
router.get('/:id', obtenerCertificacion);
router.post('/', validarCertificacion, crearCertificacion);
router.put('/:id', validarCertificacion, actualizarCertificacion);
router.delete('/:id', eliminarCertificacion);

module.exports = router;