import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../views/Login.jsx";
import Dashboard from "../views/Dashboard.jsx";
import Layout from "../components/Layout.jsx";
import Sesiones from "../views/Sesiones.jsx";
import Certificaciones from "../views/Certificaciones.jsx";
import Propuestas from "../views/Propuestas.jsx";
import Nombramientos from "../views/Nombramientos.jsx";
import Asistencias from "../views/Asistencias.jsx";
import Normativa from "../views/Normativa.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["ADMINISTRADOR", "SECRETARIA"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sesiones"
            element={
              <ProtectedRoute roles={["ADMINISTRADOR", "SECRETARIA"]}>
                <Sesiones />
              </ProtectedRoute>
            }
          />

          <Route
            path="/asistencias"
            element={
              <ProtectedRoute roles={["ADMINISTRADOR", "SECRETARIA"]}>
                <Asistencias />
              </ProtectedRoute>
            }
          />

          <Route
            path="/normativa"
            element={
              <ProtectedRoute
                roles={["ADMINISTRADOR", "SECRETARIA", "ASAMBLEISTA"]}
              >
                <Normativa />
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificaciones"
            element={
              <ProtectedRoute
                roles={["ADMINISTRADOR", "SECRETARIA", "ASAMBLEISTA"]}
              >
                <Certificaciones />
              </ProtectedRoute>
            }
          />

          <Route
            path="/propuestas"
            element={
              <ProtectedRoute roles={["ADMINISTRADOR", "SECRETARIA"]}>
                <Propuestas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nombramientos"
            element={
              <ProtectedRoute roles={["ADMINISTRADOR", "SECRETARIA"]}>
                <Nombramientos />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;