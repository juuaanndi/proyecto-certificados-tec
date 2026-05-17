const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/firebase');

const { verificarToken } = require('./middlewares/authMiddleware');
const { errorHandler } = require('./middlewares/errorMiddleware');

const usuarioRoutes = require('./routes/usuarioRoutes');
const asambleistaRoutes = require('./routes/asambleistaRoutes');
const sesionRoutes = require('./routes/sesionRoutes');
const certificacionRoutes = require('./routes/certificacionRoutes');
const propuestaRoutes = require('./routes/propuestaRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const comisionRoutes = require('./routes/comisionRoutes');
const actaRoutes = require('./routes/actaRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const nombramientoRoutes = require('./routes/nombramientoRoutes');
const resolucionRoutes = require('./routes/resolucionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba (pública)
app.get('/', (req, res) => {
  res.json({ message: 'API AIR TEC funcionando ✅' });
});

// Rutas protegidas
app.use('/api/usuarios', verificarToken, usuarioRoutes);
app.use('/api/asambleistas', verificarToken, asambleistaRoutes);
app.use('/api/sesiones', verificarToken, sesionRoutes);
app.use('/api/certificaciones', verificarToken, certificacionRoutes);
app.use('/api/propuestas', verificarToken, propuestaRoutes);
app.use('/api/agendas', verificarToken, agendaRoutes);
app.use('/api/comisiones', verificarToken, comisionRoutes);
app.use('/api/actas', verificarToken, actaRoutes);
app.use('/api/pdf', verificarToken, pdfRoutes);
app.use('/api/asistencias', verificarToken, asistenciaRoutes);
app.use('/api/nombramientos', verificarToken, nombramientoRoutes);
app.use('/api/resoluciones', verificarToken, resolucionRoutes);
app.use('/api/auth', authRoutes);

app.use(errorHandler);
module.exports = app;