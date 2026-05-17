const express = require('express');
const router = express.Router();
const { listarAsistencia, registrar, actualizar } = require('../controllers/asistenciaController');

router.get('/sesion/:idSesion', listarAsistencia);
router.post('/', registrar);
router.put('/:id', actualizar);

module.exports = router;