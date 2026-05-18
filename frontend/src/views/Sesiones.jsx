import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import api from "../controllers/api";

const TIPOS_SESION = [
  { value: "ORDINARIA", label: "Ordinaria" },
  { value: "EXTRAORDINARIA", label: "Extraordinaria" },
];

const MODALIDADES = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "VIRTUAL", label: "Virtual" },
  { value: "MIXTA", label: "Mixta" },
];

const FORM_INICIAL = {
  id_periodo: 1,
  numero: "",
  fecha: "",
  tipo: "ORDINARIA",
  modalidad: "PRESENCIAL",
  quorum_minimo: 10,
  quorum_inicio: 5,
};

function Sesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);

  useEffect(() => {
    cargarSesiones();
  }, []);

  const sesionesOrdenadas = useMemo(() => {
    return [...sesiones].sort(
      (a, b) => Number(b.ID_SESION) - Number(a.ID_SESION)
    );
  }, [sesiones]);

  const cargarSesiones = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const response = await api.get("/sesiones");

      setSesiones(response.data || []);
    } catch (error) {
      console.error("Error cargando sesiones:", error);

      const detalle =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        "No se pudieron cargar las sesiones.";

      setMensajeError(detalle);
    } finally {
      setCargando(false);
    }
  };

  const mostrarFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
      return fecha;
    }

    return fechaObj.toLocaleDateString("es-CR");
  };

  const generarNumeroSesion = () => {
    const anio = form.fecha
      ? new Date(form.fecha).getFullYear()
      : new Date().getFullYear();

    const siguiente = sesiones.length + 1;

    return `AIR-${String(siguiente).padStart(3, "0")}-${anio}`;
  };

  const limpiarFormulario = () => {
    setForm(FORM_INICIAL);
  };

  const abrirCrear = () => {
    setMensajeError("");
    setMensajeExito("");
    setModoEdicion(false);
    setIdEditando(null);
    limpiarFormulario();
    setOpen(true);
  };

  const abrirEditar = (sesion) => {
    setMensajeError("");
    setMensajeExito("");
    setModoEdicion(true);
    setIdEditando(sesion.ID_SESION);

    setForm({
      id_periodo: sesion.ID_PERIODO || 1,
      numero: sesion.NUMERO || "",
      fecha: sesion.FECHA
        ? new Date(sesion.FECHA).toISOString().split("T")[0]
        : "",
      tipo: sesion.TIPO || "ORDINARIA",
      modalidad: sesion.MODALIDAD || "PRESENCIAL",
      quorum_minimo: sesion.QUORUM_MINIMO || 10,
      quorum_inicio: sesion.QUORUM_INICIO || 5,
    });

    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setModoEdicion(false);
    setIdEditando(null);
    limpiarFormulario();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    if (!form.fecha) {
      return "Debe seleccionar una fecha.";
    }

    if (Number(form.quorum_minimo) <= 0) {
      return "El quórum mínimo debe ser mayor a cero.";
    }

    if (Number(form.quorum_inicio) <= 0) {
      return "El quórum de inicio debe ser mayor a cero.";
    }

    if (Number(form.quorum_inicio) > Number(form.quorum_minimo)) {
      return "El quórum de inicio no puede ser mayor al quórum mínimo.";
    }

    return null;
  };

  const guardarSesion = async () => {
    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensajeError(errorValidacion);
      return;
    }

    const datosSesion = {
      id_periodo: Number(form.id_periodo),
      numero: modoEdicion ? form.numero : generarNumeroSesion(),
      fecha: form.fecha,
      tipo: form.tipo.toUpperCase(),
      modalidad: form.modalidad.toUpperCase(),
      quorum_minimo: Number(form.quorum_minimo),
      quorum_inicio: Number(form.quorum_inicio),
    };

    try {
      setGuardando(true);
      setMensajeError("");
      setMensajeExito("");

      if (modoEdicion) {
        await api.put(`/sesiones/${idEditando}`, datosSesion);

        setMensajeExito("Sesión actualizada correctamente.");
      } else {
        await api.post("/sesiones", datosSesion);

        setMensajeExito("Sesión creada correctamente.");
      }

      await cargarSesiones();
      cerrarModal();
    } catch (error) {
      console.error("Error guardando sesión:", error);

      const detalle =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        "No se pudo guardar la sesión.";

      setMensajeError(detalle);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarSesionVista = async (idSesion) => {
    const confirmar = window.confirm(
      "¿Seguro que desea eliminar esta sesión?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/sesiones/${idSesion}`);

      setMensajeExito("Sesión eliminada correctamente.");

      await cargarSesiones();
    } catch (error) {
      console.error("Error eliminando sesión:", error);

      const detalle =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        "No se pudo eliminar la sesión.";

      setMensajeError(detalle);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1180,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(255,255,255,1))",
          border: "1px solid rgba(25,118,210,0.12)",
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Gestión de Sesiones
            </Typography>

            <Typography color="text.secondary">
              Administre las sesiones registradas en Oracle.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirCrear}
            sx={{
              height: 46,
              px: 3,
              borderRadius: 2,
              fontWeight: 700,
              alignSelf: { xs: "stretch", md: "center" },
            }}
          >
            Crear sesión
          </Button>
        </Stack>
      </Paper>

      {mensajeError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {mensajeError}
        </Alert>
      )}

      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {mensajeExito}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Sesiones registradas
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Total: {sesiones.length}
              </Typography>
            </Box>

            {cargando && <CircularProgress size={26} />}
          </Stack>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "rgba(25,118,210,0.06)",
                }}
              >
                <TableCell sx={{ fontWeight: 800 }}>
                  Número
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Tipo
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Fecha
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Modalidad
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Quórum mínimo
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Quórum inicio
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 800 }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Stack
                      alignItems="center"
                      spacing={2}
                      sx={{ py: 6 }}
                    >
                      <CircularProgress />

                      <Typography color="text.secondary">
                        Cargando sesiones...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : sesionesOrdenadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Stack
                      alignItems="center"
                      spacing={1.5}
                      sx={{ py: 7 }}
                    >
                      <EventAvailableIcon
                        color="disabled"
                        sx={{ fontSize: 44 }}
                      />

                      <Typography fontWeight={700}>
                        No hay sesiones registradas
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Cree la primera sesión para comenzar.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                sesionesOrdenadas.map((sesion) => (
                  <TableRow
                    key={sesion.ID_SESION}
                    hover
                    sx={{
                      "& td": {
                        py: 2,
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>
                      {sesion.NUMERO}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={sesion.TIPO}
                        size="small"
                        color={
                          sesion.TIPO === "EXTRAORDINARIA"
                            ? "warning"
                            : "primary"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      {mostrarFecha(sesion.FECHA)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={sesion.MODALIDAD}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {sesion.QUORUM_MINIMO}
                    </TableCell>

                    <TableCell>
                      {sesion.QUORUM_INICIO}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Tooltip title="Editar sesión">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              abrirEditar(sesion)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar sesión">
                          <IconButton
                            color="error"
                            onClick={() =>
                              eliminarSesionVista(
                                sesion.ID_SESION
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={open}
        onClose={cerrarModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={800}>
            {modoEdicion
              ? "Editar sesión"
              : "Crear sesión"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              select
              label="Tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              fullWidth
            >
              {TIPOS_SESION.map((tipo) => (
                <MenuItem
                  key={tipo.value}
                  value={tipo.value}
                >
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Modalidad"
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
              fullWidth
            >
              {MODALIDADES.map((modalidad) => (
                <MenuItem
                  key={modalidad.value}
                  value={modalidad.value}
                >
                  {modalidad.label}
                </MenuItem>
              ))}
            </TextField>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
            >
              <TextField
                label="Quórum mínimo"
                type="number"
                name="quorum_minimo"
                value={form.quorum_minimo}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Quórum inicio"
                type="number"
                name="quorum_inicio"
                value={form.quorum_inicio}
                onChange={handleChange}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={cerrarModal}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarSesion}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
              ? "Actualizar sesión"
              : "Guardar sesión"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sesiones;