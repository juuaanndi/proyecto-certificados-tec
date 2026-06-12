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
  if (["ASAMBLEISTA", "ASAMBLEISTA"].includes(clean)) return ROLES.ASAMBLEISTA;

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

export function canCreate() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canEdit() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canDelete() {
  return hasRole([ROLES.ADMIN]);
}

export function canAnular() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA]);
}

export function canGeneratePdf() {
  return hasRole([ROLES.ADMIN, ROLES.SECRETARIA, ROLES.ASAMBLEISTA]);
}

export function isAdmin() {
  return hasRole([ROLES.ADMIN]);
}

export function isSecretaria() {
  return hasRole([ROLES.SECRETARIA]);
}

export function isAsambleista() {
  return hasRole([ROLES.ASAMBLEISTA]);
}

export function getRoleByEmail(email) {
  const correo = email?.toLowerCase();

  if (correo === "admin@tec.ac.cr") return ROLES.ADMIN;
  if (correo === "secretaria@tec.ac.cr") return ROLES.SECRETARIA;
  if (correo === "asambleista@tec.ac.cr") return ROLES.ASAMBLEISTA;

  return ROLES.ASAMBLEISTA;
}