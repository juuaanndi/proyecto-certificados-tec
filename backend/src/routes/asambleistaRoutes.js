const express = require('express');
const router = express.Router();
const { listarAsambleistas, obtenerAsambleista } = require('../controllers/asambleistaController');

router.get('/', listarAsambleistas);
router.get('/:id', obtenerAsambleista);

module.exports = router;