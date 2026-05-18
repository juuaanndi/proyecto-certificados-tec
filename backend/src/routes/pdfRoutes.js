const express = require('express');
const router = express.Router();
const { generarCertificadoPDF } = require('../controllers/pdfController');

router.get('/certificado/:id', generarCertificadoPDF);

module.exports = router;