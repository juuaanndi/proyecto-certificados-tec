import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../views/Login.jsx";
import Dashboard from "../views/Dashboard.jsx";
import Layout from "../components/Layout.jsx";
import Sesiones from "../views/Sesiones.jsx";
import Certificaciones from "../views/Certificaciones.jsx";
import Propuestas from "../views/Propuestas.jsx";
import Nombramientos from "../views/Nombramientos.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/sesiones"
            element={<Sesiones />}
          />

          <Route
            path="/certificaciones"
            element={<Certificaciones />}
          />

          <Route
            path="/propuestas"
            element={<Propuestas />}
          />

          <Route
            path="/nombramientos"
            element={<Nombramientos />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;