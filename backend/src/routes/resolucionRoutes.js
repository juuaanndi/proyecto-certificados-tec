const express = require('express');
const router = express.Router();
const { listarResoluciones, obtenerResolucion, crearResolucion, actualizarResolucion } = require('../controllers/resolucionController');

router.get('/', listarResoluciones);
router.get('/:id', obtenerResolucion);
router.post('/', crearResolucion);
router.put('/:id', actualizarResolucion);

module.exports = router;