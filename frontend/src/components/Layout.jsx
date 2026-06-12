import { Link, Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser, hasRole } from "../utils/permissions";

function Layout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      roles: ["ADMINISTRADOR", "SECRETARIA"],
    },
    {
      label: "Sesiones",
      path: "/sesiones",
      roles: ["ADMINISTRADOR", "SECRETARIA"],
    },
    {
      label: "Asistencias",
      path: "/asistencias",
      roles: ["ADMINISTRADOR", "SECRETARIA"],
    },
    {
      label: "Normativa",
      path: "/normativa",
      roles: ["ADMINISTRADOR", "SECRETARIA", "ASAMBLEISTA"],
    },
    {
      label: "Certificaciones",
      path: "/certificaciones",
      roles: ["ADMINISTRADOR", "SECRETARIA", "ASAMBLEISTA"],
    },
    {
      label: "Propuestas",
      path: "/propuestas",
      roles: ["ADMINISTRADOR", "SECRETARIA"],
    },
    {
      label: "Nombramientos",
      path: "/nombramientos",
      roles: ["ADMINISTRADOR", "SECRETARIA"],
    },
  ];

  function cerrarSesion() {
    localStorage.removeItem("firebaseToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("id_usuario");
    navigate("/");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f9" }}>
      <aside
        style={{
          width: "240px",
          backgroundColor: "#003865",
          color: "white",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>AIR TEC</h2>

        <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.9 }}>
          <div>{user.email || "Usuario"}</div>
          <strong>{user.rol || "SIN ROL"}</strong>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "30px",
            flex: 1,
          }}
        >
          {menuItems
            .filter((item) => hasRole(item.roles))
            .map((item) => (
              <Link key={item.path} style={linkStyle} to={item.path}>
                {item.label}
              </Link>
            ))}
        </nav>

        <button onClick={cerrarSesion} style={logoutStyle}>
          Cerrar sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

const logoutStyle = {
  marginTop: "24px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid white",
  backgroundColor: "transparent",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Layout;