import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import api from "../controllers/api";

const formInicial = {
  id_nombramiento: "",
  id_usuario_emisor: "",
  numero_documento: "",
  fecha_emision: "",
  estado: "VIGENTE",
  descripcion_motivo_anulado: "",
};

function normalizarFecha(fecha) {
  if (!fecha) return "";
  try {
    return new Date(fecha).toISOString().split("T")[0];
  } catch {
    return String(fecha).substring(0, 10);
  }
}

function Certificaciones() {
  const [certificaciones, setCertificaciones] = useState([]);
  const [catalogos, setCatalogos] = useState({
    nombramientos: [],
    usuarios: [],
    estados: ["VIGENTE", "ANULADA"],
  });

  const [form, setForm] = useState(formInicial);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idActual, setIdActual] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    await Promise.all([cargarCertificaciones(), cargarCatalogos()]);
  }

  async function cargarCertificaciones() {
    try {
      const response = await api.get("/certificaciones");
      setCertificaciones(response.data || []);
    } catch (error) {
      console.error(error);
      setMensajeError(
        error?.response?.data?.error || "Error cargando certificaciones."
      );
    }
  }

  async function cargarCatalogos() {
    try {
      const response = await api.get("/certificaciones/catalogos");
      setCatalogos({
        nombramientos: response.data.nombramientos || [],
        usuarios: response.data.usuarios || [],
        estados: response.data.estados || ["VIGENTE", "ANULADA"],
      });
    } catch (error) {
      console.error(error);
      setMensajeError(
        error?.response?.data?.error || "Error cargando catálogos."
      );
    }
  }

  function abrirCrear() {
    setMensajeError("");
    setMensajeExito("");
    setModoEdicion(false);
    setIdActual(null);

    setForm({
      ...formInicial,
      id_nombramiento: catalogos.nombramientos[0]?.ID_NOMBRAMIENTO || "",
      id_usuario_emisor: catalogos.usuarios[0]?.ID_USUARIO || "",
      fecha_emision: new Date().toISOString().split("T")[0],
      numero_documento: `CERT-${new Date().getFullYear()}-${String(
        certificaciones.length + 1
      ).padStart(4, "0")}`,
    });

    setOpen(true);
  }

  function abrirEditar(certificacion) {
    setMensajeError("");
    setMensajeExito("");
    setModoEdicion(true);
    setIdActual(certificacion.ID_CERTIFICACION);

    setForm({
      id_nombramiento: certificacion.ID_NOMBRAMIENTO || "",
      id_usuario_emisor: certificacion.ID_USUARIO_EMISOR || "",
      numero_documento: certificacion.NUMERO_DOCUMENTO || "",
      fecha_emision: normalizarFecha(certificacion.FECHA_EMISION),
      estado: certificacion.ESTADO || "VIGENTE",
      descripcion_motivo_anulado:
        certificacion.DESCRIPCION_MOTIVO_ANULADO || "",
    });

    setOpen(true);
  }

  function cerrarModal() {
    setOpen(false);
    setModoEdicion(false);
    setIdActual(null);
    setForm(formInicial);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const nuevoForm = {
        ...prev,
        [name]: value,
      };

      if (name === "estado" && value === "VIGENTE") {
        nuevoForm.descripcion_motivo_anulado = "";
      }

      return nuevoForm;
    });
  }

  function validarFormulario() {
    if (!modoEdicion) {
      if (!form.id_nombramiento) return "Debe seleccionar un nombramiento.";
      if (!form.id_usuario_emisor) return "Debe seleccionar un usuario emisor.";
      if (!form.numero_documento.trim())
        return "Debe indicar el número de documento.";
      if (!form.fecha_emision) return "Debe indicar la fecha de emisión.";
    }

    if (!form.estado) return "Debe seleccionar un estado.";

    if (form.estado === "ANULADA" && !form.descripcion_motivo_anulado.trim()) {
      return "Debe indicar el motivo de anulación.";
    }

    return null;
  }

  function construirPayload() {
    return {
      id_nombramiento: Number(form.id_nombramiento),
      id_usuario_emisor: Number(form.id_usuario_emisor),
      numero_documento: form.numero_documento.trim(),
      fecha_emision: form.fecha_emision,
      estado: form.estado,
      descripcion_motivo_anulado:
        form.estado === "ANULADA"
          ? form.descripcion_motivo_anulado.trim()
          : null,
    };
  }

  async function guardarCertificacion() {
    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensajeError(errorValidacion);
      return;
    }

    try {
      setGuardando(true);
      setMensajeError("");
      setMensajeExito("");

      const payload = construirPayload();

      if (modoEdicion) {
        await api.put(`/certificaciones/${idActual}`, payload);
        setMensajeExito("Certificación actualizada correctamente.");
      } else {
        await api.post("/certificaciones", payload);
        setMensajeExito("Certificación creada correctamente.");
      }

      cerrarModal();
      await cargarCertificaciones();
    } catch (error) {
      console.error(error);
      setMensajeError(
        error?.response?.data?.error || "Error guardando certificación."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCertificacion(id) {
    const confirmar = window.confirm(
      "¿Seguro que desea eliminar esta certificación?"
    );

    if (!confirmar) return;

    try {
      setMensajeError("");
      setMensajeExito("");

      await api.delete(`/certificaciones/${id}`);
      setMensajeExito("Certificación eliminada correctamente.");
      await cargarCertificaciones();
    } catch (error) {
      console.error(error);
      setMensajeError(
        error?.response?.data?.error || "Error eliminando certificación."
      );
    }
  }

  const certificacionesOrdenadas = useMemo(() => {
    return [...certificaciones].sort(
      (a, b) => Number(b.ID_CERTIFICACION) - Number(a.ID_CERTIFICACION)
    );
  }, [certificaciones]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1260,
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
            "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(255,255,255,1))",
          border: "1px solid rgba(25,118,210,0.12)",
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h3" fontWeight={800}>
              Gestión de Certificaciones
            </Typography>

            <Typography color="text.secondary">
              Emita, consulte y anule certificaciones registradas en Oracle.
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
            }}
          >
            Nueva certificación
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
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={800}>
            Certificaciones registradas
          </Typography>

          <Typography color="text.secondary">
            Total: {certificaciones.length}
          </Typography>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(25,118,210,0.06)" }}>
                <TableCell sx={{ fontWeight: 800 }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Asambleísta</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Nombramiento</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Emisor</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Motivo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {certificacionesOrdenadas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Stack alignItems="center" spacing={1.5} sx={{ py: 7 }}>
                      <Typography fontWeight={700}>
                        No hay certificaciones registradas
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Cree la primera certificación para comenzar.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                certificacionesOrdenadas.map((certificacion) => (
                  <TableRow key={certificacion.ID_CERTIFICACION} hover>
                    <TableCell>{certificacion.NUMERO_DOCUMENTO}</TableCell>
                    <TableCell>{certificacion.NOMBRE_ASAMBLEISTA}</TableCell>
                    <TableCell>{certificacion.PUESTO}</TableCell>
                    <TableCell>{certificacion.USUARIO_EMISOR}</TableCell>
                    <TableCell>
                      {normalizarFecha(certificacion.FECHA_EMISION)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={certificacion.ESTADO}
                        color={
                          certificacion.ESTADO === "VIGENTE"
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      {certificacion.DESCRIPCION_MOTIVO_ANULADO || "—"}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Editar / anular">
                          <IconButton
                            color="primary"
                            onClick={() => abrirEditar(certificacion)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Descargar PDF">
                          <IconButton
                            color="secondary"
                            onClick={() =>
                              window.open(
                                `http://localhost:3000/api/pdf/certificado/${certificacion.ID_CERTIFICACION}`,
                                "_blank"
                              )
                            }
                          >
                            <PictureAsPdfIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar certificación">
                          <IconButton
                            color="error"
                            onClick={() =>
                              eliminarCertificacion(
                                certificacion.ID_CERTIFICACION
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

      <Dialog open={open} onClose={cerrarModal} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h5" fontWeight={800}>
            {modoEdicion ? "Editar certificación" : "Nueva certificación"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              select
              label="Nombramiento"
              name="id_nombramiento"
              value={form.id_nombramiento}
              onChange={handleChange}
              fullWidth
              disabled={modoEdicion}
            >
              {catalogos.nombramientos.map((n) => (
                <MenuItem key={n.ID_NOMBRAMIENTO} value={n.ID_NOMBRAMIENTO}>
                  {n.NOMBRE}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Usuario emisor"
              name="id_usuario_emisor"
              value={form.id_usuario_emisor}
              onChange={handleChange}
              fullWidth
              disabled={modoEdicion}
            >
              {catalogos.usuarios.map((u) => (
                <MenuItem key={u.ID_USUARIO} value={u.ID_USUARIO}>
                  {u.USERNAME}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Número de documento"
              name="numero_documento"
              value={form.numero_documento}
              onChange={handleChange}
              fullWidth
              disabled={modoEdicion}
            />

            <TextField
              type="date"
              label="Fecha de emisión"
              name="fecha_emision"
              value={form.fecha_emision}
              onChange={handleChange}
              fullWidth
              disabled={modoEdicion}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              fullWidth
            >
              {catalogos.estados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Motivo de anulación"
              name="descripcion_motivo_anulado"
              value={form.descripcion_motivo_anulado}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
              helperText="Indique el motivo si la certificación está anulada."
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarModal} disabled={guardando}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarCertificacion}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
              ? "Actualizar certificación"
              : "Guardar certificación"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Certificaciones;