const express = require('express');
const router = express.Router();
const { listarAgendas, obtenerAgenda } = require('../controllers/agendaController');

router.get('/', listarAgendas);
router.get('/:id', obtenerAgenda);

module.exports = router;