const express = require('express');
const router = express.Router();
const { listarPropuestas, obtenerPropuesta, crearPropuesta, actualizarPropuesta, eliminarPropuesta } = require('../controllers/propuestaController');
const { validarPropuesta } = require('../middlewares/validacionMiddleware');

router.get('/', listarPropuestas);
router.get('/:id', obtenerPropuesta);
router.post('/', validarPropuesta, crearPropuesta);
router.put('/:id', validarPropuesta, actualizarPropuesta);
router.delete('/:id', eliminarPropuesta);

module.exports = router;