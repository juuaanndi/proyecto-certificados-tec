const express = require('express');
const router = express.Router();
const { listarNombramientos, obtenerNombramiento, crearNombramiento, actualizarNombramiento } = require('../controllers/nombramientoController');

router.get('/', listarNombramientos);
router.get('/:id', obtenerNombramiento);
router.post('/', crearNombramiento);
router.put('/:id', actualizarNombramiento);

module.exports = router;