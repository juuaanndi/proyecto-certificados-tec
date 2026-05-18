const express = require('express');
const router = express.Router();
const { listarSesiones, obtenerSesion, crearSesion, actualizarSesion, eliminarSesion } = require('../controllers/sesionController');
const { validarSesion } = require('../middlewares/validacionMiddleware');

router.get('/', listarSesiones);
router.get('/:id', obtenerSesion);
router.post('/', validarSesion, crearSesion);
router.put('/:id', validarSesion, actualizarSesion);
router.delete('/:id', eliminarSesion);

module.exports = router;