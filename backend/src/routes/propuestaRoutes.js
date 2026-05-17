const express = require('express');
const router = express.Router();
const { listarPropuestas, obtenerPropuesta, crearPropuesta, actualizarPropuesta, eliminarPropuesta } = require('../controllers/propuestaController');

router.get('/', listarPropuestas);
router.get('/:id', obtenerPropuesta);
router.post('/', crearPropuesta);
router.put('/:id', actualizarPropuesta);
router.delete('/:id', eliminarPropuesta);

module.exports = router;