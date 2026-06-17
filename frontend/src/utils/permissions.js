export const ROLES = {
  ADMIN: "ADMINISTRADOR",
  SECRETARIA: "SECRETARIA",
  ASAMBLEISTA: "ASAMBLEISTA",
};

export function normalizeRole(role) {
  if (!role) return "";

  const clean = role
    .toString()
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["ADMIN", "ADMINISTRADOR"].includes(clean)) return ROLES.ADMIN;
  if (["SECRETARIA", "SECRETARIO"].includes(clean)) return ROLES.SECRETARIA;
  if (["ASAMBLEISTA"].includes(clean)) return ROLES.ASAMBLEISTA;

  return clean;
}

export function getCurrentUser() {
  return {
    id_usuario: localStorage.getItem("id_usuario"),
    email: localStorage.getItem("userEmail"),
    rol: normalizeRole(localStorage.getItem("userRole")),
    token: localStorage.getItem("firebaseToken"),
  };
}

export function getCurrentRole() {
  return normalizeRole(localStorage.getItem("userRole"));
}

export function hasRole(rolesPermitidos = []) {
  const rolActual = getCurrentRole();
  return rolesPermitidos.map(normalizeRole).includes(rolActual);
}

function isCertificacionesRoute() {
  return window.location.pathname.toLowerCase().includes("certificaciones");
}

/*
  PERMISOS GENERALES
*/

export function canCreate() {
  /*
    Regla especial:
    - En Certificaciones, solo Admin puede crear.
    - En los demás módulos, Admin y Secretaría pueden crear.
    Esto evita tocar Certificaciones.jsx y no afecta Normativa.
  */
  if (isCertificacionesRoute()) {
    return hasRole([ROLES.ADMIN]);
  }

  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canEdit() {
  /*
    Regla especial:
    - En Certificaciones, solo Admin puede editar.
    - En los demás módulos, Admin y Secretaría pueden editar.
    Esto evita tocar Certificaciones.jsx y no afecta Normativa.
  */
  if (isCertificacionesRoute()) {
    return hasRole([ROLES.ADMIN]);
  }

  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canDelete() {
  return hasRole([ROLES.ADMIN]);
}

export function canAnular() {
  /*
    Regla especial:
    - En Certificaciones, solo Admin puede anular.
    - En los demás módulos, Admin y Secretaría pueden anular si el módulo lo permite.
  */
  if (isCertificacionesRoute()) {
    return hasRole([ROLES.ADMIN]);
  }

  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

/*
  PDF DE CERTIFICACIONES
  Solo Administrador puede descargar/generar PDF.
*/

export function canGeneratePdf() {
  return hasRole([ROLES.ADMIN]);
}

/*
  VISIBILIDAD DE VISTAS
*/

export function canViewDashboard() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canViewNormativa() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA, ROLES.ASAMBLEISTA]);
}

export function canViewCertificaciones() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canViewSesiones() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canViewAsistencias() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canViewPropuestas() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canViewNombramientos() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

/*
  HELPERS DE ROL
*/

export function isAdmin() {
  return hasRole([ROLES.ADMIN]);
}

export function isSecretaria() {
  return hasRole([ROLES.SECRETARIA]);
}

export function isAsambleista() {
  return hasRole([ROLES.ASAMBLEISTA]);
}

/*
  MAPEO TEMPORAL DE CORREO A ROL
*/

export function getRoleByEmail(email) {
  const correo = email?.toLowerCase();

  if (correo === "admin@tec.ac.cr") return ROLES.ADMIN;
  if (correo === "secretaria@tec.ac.cr") return ROLES.SECRETARIA;
  if (correo === "asambleista@tec.ac.cr") return ROLES.ASAMBLEISTA;

  return ROLES.ASAMBLEISTA;
}