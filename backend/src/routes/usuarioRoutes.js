const express = require('express');
const router = express.Router();
const { listarUsuarios } = require('../controllers/usuarioController');

router.get('/', listarUsuarios);

module.exports = router;