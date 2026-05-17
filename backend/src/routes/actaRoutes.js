const express = require('express');
const router = express.Router();
const { listarActas, obtenerActa } = require('../controllers/actaController');

router.get('/', listarActas);
router.get('/:id', obtenerActa);

module.exports = router;