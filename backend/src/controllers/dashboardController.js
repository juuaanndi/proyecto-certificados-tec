const { getDashboardData } = require("../models/dashboardModel");

async function obtenerDashboard(req, res) {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (error) {
    console.error("Error cargando dashboard:", error);

    res.status(500).json({
      error: "Error interno del servidor",
      detalle: error.message,
    });
  }
}

module.exports = {
  obtenerDashboard,
};