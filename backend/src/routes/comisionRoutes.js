const express = require('express');
const router = express.Router();
const { listarComisiones, obtenerComision } = require('../controllers/comisionController');

router.get('/', listarComisiones);
router.get('/:id', obtenerComision);

module.exports = router;