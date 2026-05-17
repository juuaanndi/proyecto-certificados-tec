const express = require('express');
const router = express.Router();
const { listarSesiones, obtenerSesion } = require('../controllers/sesionController');

router.get('/', listarSesiones);
router.get('/:id', obtenerSesion);

module.exports = router;