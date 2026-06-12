import { Navigate } from "react-router-dom";
import { hasRole, getCurrentUser } from "../utils/permissions";

function ProtectedRoute({ roles = [], children }) {
  const user = getCurrentUser();

  if (!user.token) {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Acceso restringido</h1>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;