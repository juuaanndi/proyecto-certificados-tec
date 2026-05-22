const express = require('express');
const router = express.Router();
const { obtenerArbol, obtenerNormativa, crearNormativa, obtenerHistorico } = require('../controllers/normativaController');

router.get('/arbol', obtenerArbol);
router.get('/historico/:codigo', obtenerHistorico);
router.get('/:id', obtenerNormativa);
router.post('/', crearNormativa);

module.exports = router;