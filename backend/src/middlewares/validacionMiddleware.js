const { body, validationResult } = require('express-validator');

function validarResultados(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
}

const validarSesion = [
  body('id_periodo').notEmpty().withMessage('ID de período requerido'),
  body('numero').notEmpty().withMessage('Número de sesión requerido'),
  body('fecha').notEmpty().isDate().withMessage('Fecha válida requerida'),
  body('tipo').notEmpty().withMessage('Tipo de sesión requerido'),
  body('modalidad').notEmpty().withMessage('Modalidad requerida'),
  validarResultados
];

const validarPropuesta = [
  body('id_periodo').notEmpty().withMessage('ID de período requerido'),
  body('codigo_air').notEmpty().withMessage('Código AIR requerido'),
  body('titulo').notEmpty().withMessage('Título requerido'),
  body('tipo').notEmpty().withMessage('Tipo requerido'),
  validarResultados
];

const validarCertificacion = [
  body('id_nombramiento').notEmpty().withMessage('ID de nombramiento requerido'),
  body('id_usuario_emisor').notEmpty().withMessage('ID de usuario emisor requerido'),
  body('numero_documento').notEmpty().withMessage('Número de documento requerido'),
  body('fecha_emision').notEmpty().isDate().withMessage('Fecha de emisión válida requerida'),
  validarResultados
];

const validarNombramiento = [
  body('id_asambleista').notEmpty().withMessage('ID de asambleísta requerido'),
  body('id_periodo').notEmpty().withMessage('ID de período requerido'),
  body('puesto').notEmpty().withMessage('Puesto requerido'),
  body('inicio').notEmpty().isDate().withMessage('Fecha de inicio válida requerida'),
  validarResultados
];

module.exports = { validarSesion, validarPropuesta, validarCertificacion, validarNombramiento };