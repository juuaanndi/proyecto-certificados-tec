const { getAgendas, getAgendaById } = require('../models/agendaModel');

async function listarAgendas(req, res) {
  try {
    const agendas = await getAgendas();
    res.json(agendas);
  } catch (error) {
    console.error('Error al listar agendas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerAgenda(req, res) {
  try {
    const agenda = await getAgendaById(req.params.id);
    if (!agenda) {
      return res.status(404).json({ error: 'Agenda no encontrada' });
    }
    res.json(agenda);
  } catch (error) {
    console.error('Error al obtener agenda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listarAgendas, obtenerAgenda };