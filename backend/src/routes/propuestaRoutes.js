const express = require('express');
const router = express.Router();
const { listarPropuestas, obtenerPropuesta } = require('../controllers/propuestaController');

router.get('/', listarPropuestas);
router.get('/:id', obtenerPropuesta);

module.exports = router;