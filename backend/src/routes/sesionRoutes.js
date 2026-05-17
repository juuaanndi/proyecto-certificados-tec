const express = require('express');
const router = express.Router();
const { listarSesiones, obtenerSesion, crearSesion, actualizarSesion, eliminarSesion } = require('../controllers/sesionController');

router.get('/', listarSesiones);
router.get('/:id', obtenerSesion);
router.post('/', crearSesion);
router.put('/:id', actualizarSesion);
router.delete('/:id', eliminarSesion);

module.exports = router;