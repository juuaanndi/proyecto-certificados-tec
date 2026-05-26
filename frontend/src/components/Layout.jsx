import { Link, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f9" }}>
      <aside
        style={{
          width: "240px",
          backgroundColor: "#003865",
          color: "white",
          padding: "24px",
        }}
      >
        <h2>AIR TEC</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "30px" }}>
          <Link style={linkStyle} to="/dashboard">Dashboard</Link>
          <Link style={linkStyle} to="/sesiones">Sesiones</Link>
          <Link style={linkStyle} to="/certificaciones">Certificaciones</Link>
          <Link style={linkStyle} to="/propuestas">Propuestas</Link>
          <Link style={linkStyle} to="/nombramientos">Nombramientos</Link>
        </nav>
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

export default Layout;