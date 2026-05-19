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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import api from "../controllers/api";

const catalogosIniciales = {
  asambleistas: [],
  periodos: [],
  sectores: [],
  condiciones: ["TITULAR", "SUPLENTE"],
  estados: ["VIGENTE", "FINALIZADO", "RENUNCIA"],
};

const formInicial = {
  id_asambleista: "",
  id_periodo: 1,
  id_sector: "",
  puesto: "",
  condicion: "TITULAR",
  inicio: "",
  fin: "",
  estado: "VIGENTE",
  num_resolucion: "",
};

function normalizarFecha(fecha) {
  if (!fecha) return "";

  try {
    return new Date(fecha).toISOString().split("T")[0];
  } catch {
    return fecha;
  }
}

function Nombramientos() {
  const [nombramientos, setNombramientos] = useState([]);
  const [catalogos, setCatalogos] = useState(catalogosIniciales);

  const [form, setForm] = useState(formInicial);

  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idActual, setIdActual] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setCargando(true);

      await Promise.all([
        cargarNombramientos(),
        cargarCatalogos(),
      ]);
    } catch (error) {
      console.error(error);
      setMensajeError("Error cargando información.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarNombramientos() {
    try {
      const response = await api.get("/nombramientos");
      setNombramientos(response.data || []);
    } catch (error) {
      console.error(error);
      setMensajeError("Error cargando nombramientos.");
    }
  }

  async function cargarCatalogos() {
    try {
      const response = await api.get("/nombramientos/catalogos");

      setCatalogos({
        asambleistas: response.data.asambleistas || [],
        periodos: response.data.periodos || [],
        sectores: response.data.sectores || [],
        condiciones: ["TITULAR", "SUPLENTE"],
        estados: ["VIGENTE", "FINALIZADO", "RENUNCIA"],
      });
    } catch (error) {
      console.error(error);
      setMensajeError("Error cargando catálogos.");
    }
  }

  function abrirCrear() {
    setModoEdicion(false);
    setIdActual(null);
    setForm(formInicial);
    setOpen(true);
  }

  function abrirEditar(nombramiento) {
    setModoEdicion(true);

    setIdActual(nombramiento.ID_NOMBRAMIENTO);

    setForm({
      id_asambleista: nombramiento.ID_ASAMBLEISTA,
      id_periodo: nombramiento.ID_PERIODO,
      id_sector: nombramiento.ID_SECTOR,
      puesto: nombramiento.PUESTO || "",
      condicion: nombramiento.CONDICION || "TITULAR",
      inicio: normalizarFecha(nombramiento.INICIO),
      fin: normalizarFecha(nombramiento.FIN),
      estado: nombramiento.ESTADO || "VIGENTE",
      num_resolucion: nombramiento.NUM_RESOLUCION || "",
    });

    setOpen(true);
  }

  function cerrarModal() {
    setOpen(false);
    setForm(formInicial);
    setIdActual(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function construirPayload() {
    return {
      id_asambleista: Number(form.id_asambleista),
      id_periodo: Number(form.id_periodo),
      id_sector: Number(form.id_sector),
      puesto: form.puesto.trim(),
      condicion: form.condicion,
      inicio: form.inicio,
      fin: form.fin || null,
      estado: form.estado,
      num_resolucion: form.num_resolucion.trim() || null,
    };
  }

  async function guardarNombramiento() {
    try {
      setGuardando(true);
      setMensajeError("");
      setMensajeExito("");

      const payload = construirPayload();

      if (modoEdicion) {
        await api.put(`/nombramientos/${idActual}`, payload);

        setMensajeExito("Nombramiento actualizado correctamente.");
      } else {
        await api.post("/nombramientos", payload);

        setMensajeExito("Nombramiento creado correctamente.");
      }

      cerrarModal();
      cargarNombramientos();
    } catch (error) {
      console.error(error);

      setMensajeError(
        error?.response?.data?.detalle ||
          "Error guardando nombramiento."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarNombramientoVista(id) {
    try {
      await api.delete(`/nombramientos/${id}`);

      setMensajeExito("Nombramiento eliminado correctamente.");

      cargarNombramientos();
    } catch (error) {
      console.error(error);

      setMensajeError(
        error?.response?.data?.detalle ||
          "Error eliminando nombramiento."
      );
    }
  }

  const nombramientosOrdenados = useMemo(() => {
    return [...nombramientos].sort(
      (a, b) => b.ID_NOMBRAMIENTO - a.ID_NOMBRAMIENTO
    );
  }, [nombramientos]);

  return (
    <Box sx={{ p: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 5,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(25,118,210,0.03))",
          border: "1px solid rgba(25,118,210,0.08)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h3" fontWeight={800}>
              Gestión de Nombramientos
            </Typography>

            <Typography color="text.secondary">
              Administre nombramientos reales registrados en Oracle.
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
            Nuevo nombramiento
          </Button>
        </Stack>
      </Paper>

      {mensajeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mensajeError}
        </Alert>
      )}

      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensajeExito}
        </Alert>
      )}

      <Paper elevation={2}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={800}>
            Nombramientos registrados
          </Typography>

          <Typography color="text.secondary">
            Total: {nombramientos.length}
          </Typography>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Asambleísta</strong></TableCell>
                <TableCell><strong>Sector</strong></TableCell>
                <TableCell><strong>Puesto</strong></TableCell>
                <TableCell><strong>Condición</strong></TableCell>
                <TableCell><strong>Inicio</strong></TableCell>
                <TableCell><strong>Fin</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="right">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {nombramientosOrdenados.map((nombramiento) => (
                <TableRow key={nombramiento.ID_NOMBRAMIENTO}>
                  <TableCell>
                    {nombramiento.NOMBRE_ASAMBLEISTA}
                  </TableCell>

                  <TableCell>
                    {nombramiento.NOMBRE_SECTOR}
                  </TableCell>

                  <TableCell>{nombramiento.PUESTO}</TableCell>

                  <TableCell>
                    <Chip
                      label={nombramiento.CONDICION}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {normalizarFecha(nombramiento.INICIO)}
                  </TableCell>

                  <TableCell>
                    {nombramiento.FIN
                      ? normalizarFecha(nombramiento.FIN)
                      : "Sin fecha fin"}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={nombramiento.ESTADO}
                      color={
                        nombramiento.ESTADO === "VIGENTE"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => abrirEditar(nombramiento)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() =>
                            eliminarNombramientoVista(
                              nombramiento.ID_NOMBRAMIENTO
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={cerrarModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {modoEdicion
            ? "Editar nombramiento"
            : "Nuevo nombramiento"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Asambleísta"
              name="id_asambleista"
              value={form.id_asambleista}
              onChange={handleChange}
              fullWidth
            >
              {catalogos.asambleistas.map((a) => (
                <MenuItem
                  key={a.ID_ASAMBLEISTA}
                  value={a.ID_ASAMBLEISTA}
                >
                  {a.NOMBRE}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Periodo AIR"
              name="id_periodo"
              value={form.id_periodo}
              onChange={handleChange}
              fullWidth
            >
              {catalogos.periodos.map((p) => (
                <MenuItem
                  key={p.ID_PERIODO}
                  value={p.ID_PERIODO}
                >
                  {p.NOMBRE}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Sector"
              name="id_sector"
              value={form.id_sector}
              onChange={handleChange}
              fullWidth
            >
              {catalogos.sectores.map((s) => (
                <MenuItem
                  key={s.ID_SECTOR}
                  value={s.ID_SECTOR}
                >
                  {s.NOMBRE}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Puesto"
              name="puesto"
              value={form.puesto}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              select
              label="Condición"
              name="condicion"
              value={form.condicion}
              onChange={handleChange}
              fullWidth
            >
              {catalogos.condiciones.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Fecha inicio"
              name="inicio"
              value={form.inicio}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="date"
              label="Fecha fin"
              name="fin"
              value={form.fin}
              onChange={handleChange}
              fullWidth
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
              {catalogos.estados.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Número resolución"
              name="num_resolucion"
              value={form.num_resolucion}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarModal}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarNombramiento}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
              ? "Actualizar nombramiento"
              : "Guardar nombramiento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Nombramientos;