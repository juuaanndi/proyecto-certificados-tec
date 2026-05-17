const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./routes/usuarioRoutes');
const asambleistaRoutes = require('./routes/asambleistaRoutes');
const sesionRoutes = require('./routes/sesionRoutes');
const certificacionRoutes = require('./routes/certificacionRoutes');
const propuestaRoutes = require('./routes/propuestaRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const comisionRoutes = require('./routes/comisionRoutes');
const actaRoutes = require('./routes/actaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/asambleistas', asambleistaRoutes);
app.use('/api/sesiones', sesionRoutes);
app.use('/api/certificaciones', certificacionRoutes);
app.use('/api/propuestas', propuestaRoutes);
app.use('/api/agendas', agendaRoutes);
app.use('/api/comisiones', comisionRoutes);
app.use('/api/actas', actaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API AIR TEC funcionando ✅' });
});

module.exports = app;