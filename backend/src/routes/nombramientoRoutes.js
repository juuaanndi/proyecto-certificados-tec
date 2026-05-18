const express = require('express');
const router = express.Router();
const { listarNombramientos, obtenerNombramiento, crearNombramiento, actualizarNombramiento } = require('../controllers/nombramientoController');
const { validarNombramiento } = require('../middlewares/validacionMiddleware');

router.get('/', listarNombramientos);
router.get('/:id', obtenerNombramiento);
router.post('/', validarNombramiento, crearNombramiento);
router.put('/:id', validarNombramiento, actualizarNombramiento);

module.exports = router;