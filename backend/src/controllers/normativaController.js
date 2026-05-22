const { getArbolNormativa, getNormativaById, createNormativa, getHistoricoNormativa } = require('../models/normativaModel');

async function obtenerArbol(req, res) {
  try {
    const arbol = await getArbolNormativa();
    res.json(arbol);
  } catch (error) {
    console.error('Error al obtener árbol de normativa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerNormativa(req, res) {
  try {
    const normativa = await getNormativaById(req.params.id);
    if (!normativa) {
      return res.status(404).json({ error: 'Normativa no encontrada' });
    }
    res.json(normativa);
  } catch (error) {
    console.error('Error al obtener normativa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function crearNormativa(req, res) {
  try {
    const { nivel, id_padre } = req.body;

    // Validación jerárquica
    if (nivel === 'CAPITULO' && !id_padre) {
      return res.status(400).json({ error: 'Un capítulo debe tener un título padre' });
    }
    if (nivel === 'ARTICULO' && !id_padre) {
      return res.status(400).json({ error: 'Un artículo debe tener un capítulo padre' });
    }
    if (nivel === 'INCISO' && !id_padre) {
      return res.status(400).json({ error: 'Un inciso debe tener un artículo padre' });
    }

    // Validar que el padre tenga el nivel correcto
    if (id_padre) {
      const padre = await getNormativaById(id_padre);
      if (!padre) {
        return res.status(404).json({ error: 'Nodo padre no encontrado' });
      }

      const jerarquia = { TITULO: 0, CAPITULO: 1, ARTICULO: 2, INCISO: 3 };
      if (jerarquia[nivel] !== jerarquia[padre.NIVEL] + 1) {
        return res.status(400).json({ 
          error: `Un ${nivel} solo puede estar dentro de un ${Object.keys(jerarquia)[jerarquia[nivel] - 1]}` 
        });
      }
    }

    const id = await createNormativa(req.body);
    res.status(201).json({ message: 'Normativa creada', id });
  } catch (error) {
    console.error('Error al crear normativa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerHistorico(req, res) {
  try {
    const historico = await getHistoricoNormativa(req.params.codigo);
    res.json(historico);
  } catch (error) {
    console.error('Error al obtener histórico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { obtenerArbol, obtenerNormativa, crearNormativa, obtenerHistorico };