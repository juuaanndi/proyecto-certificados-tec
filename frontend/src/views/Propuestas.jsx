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

import api from "../controllers/api";

const TIPOS_PROPUESTA = [
  { value: "BASE", label: "Base" },
  { value: "CONCILIADA", label: "Conciliada" },
];

const ES_BASE_OPCIONES = [
  { value: 1, label: "Sí" },
  { value: 0, label: "No" },
];

const FORM_INICIAL = {
  id_periodo: 1,
  codigo_air: "",
  titulo: "",
  tipo: "BASE",
  es_base: 1,
  id_propuesta_padre: "",
};

function Propuestas() {
  const [propuestas, setPropuestas] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [form, setForm] = useState(FORM_INICIAL);

  useEffect(() => {
    cargarPropuestas();
  }, []);

  useEffect(() => {
    if (Number(form.es_base) === 1) {
      setForm((prev) => ({
        ...prev,
        id_propuesta_padre: "",
      }));
    }
  }, [form.es_base]);

  const propuestasOrdenadas = useMemo(() => {
    return [...propuestas].sort(
      (a, b) => Number(b.ID_PROPUESTA) - Number(a.ID_PROPUESTA)
    );
  }, [propuestas]);

  const cargarPropuestas = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const response = await api.get("/propuestas");

      setPropuestas(response.data || []);
    } catch (error) {
      console.error("Error cargando propuestas:", error);

      const detalle =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        "No se pudieron cargar las propuestas.";

      setMensajeError(detalle);
    } finally {
      setCargando(false);
    }
  };

  const generarCodigoPropuesta = () => {
    const anio = new Date().getFullYear();

    const propuestasDelAnio = propuestas
      .map((propuesta) => propuesta.CODIGO_AIR)
      .filter(Boolean)
      .filter((codigo) => codigo.endsWith(`-${anio}`))
      .map((codigo) => {
        const partes = codigo.split("-");
        return Number(partes[1]);
      })
      .filter((numero) => !Number.isNaN(numero));

    const siguiente =
      propuestasDelAnio.length > 0
        ? Math.max(...propuestasDelAnio) + 1
        : 1;

    return `PROP-${String(siguiente).padStart(3, "0")}-${anio}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const abrirCrear = () => {
    setMensajeError("");
    setMensajeExito("");

    setModoEdicion(false);
    setIdEditando(null);

    setForm({
      ...FORM_INICIAL,
      codigo_air: generarCodigoPropuesta(),
    });

    setOpen(true);
  };

  const abrirEditar = (propuesta) => {
    setMensajeError("");
    setMensajeExito("");

    setModoEdicion(true);
    setIdEditando(propuesta.ID_PROPUESTA);

    setForm({
      id_periodo: propuesta.ID_PERIODO || 1,
      codigo_air: propuesta.CODIGO_AIR || "",
      titulo: propuesta.TITULO || "",
      tipo: propuesta.TIPO || "BASE",
      es_base: Number(propuesta.ES_BASE),
      id_propuesta_padre:
        propuesta.ID_PROPUESTA_PADRE || "",
    });

    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setModoEdicion(false);
    setIdEditando(null);
    setForm(FORM_INICIAL);
  };

  const guardarPropuesta = async () => {
    if (
      !form.codigo_air ||
      !form.titulo ||
      !form.tipo
    ) {
      setMensajeError(
        "Complete todos los campos obligatorios."
      );
      return;
    }

    const datos = {
      id_periodo: Number(form.id_periodo),
      codigo_air: form.codigo_air,
      titulo: form.titulo,
      tipo: form.tipo,
      es_base: Number(form.es_base),
      id_propuesta_padre:
        form.id_propuesta_padre === ""
          ? null
          : Number(form.id_propuesta_padre),
    };

    try {
      setGuardando(true);
      setMensajeError("");
      setMensajeExito("");

      if (modoEdicion) {
        await api.put(
          `/propuestas/${idEditando}`,
          datos
        );

        setMensajeExito(
          "Propuesta actualizada correctamente."
        );
      } else {
        await api.post("/propuestas", datos);

        setMensajeExito(
          "Propuesta creada correctamente."
        );
      }

      cerrarModal();
      await cargarPropuestas();
    } catch (error) {
      console.error(
        "Error guardando propuesta:",
        error
      );

      const detalle =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        "No se pudo guardar la propuesta.";

      setMensajeError(detalle);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPropuestaVista = async (
    idPropuesta
  ) => {
    const confirmar = window.confirm(
      "¿Seguro que desea eliminar esta propuesta?"
    );

    if (!confirmar) return;

    try {
      setMensajeError("");
      setMensajeExito("");

      await api.delete(
        `/propuestas/${idPropuesta}`
      );

      await cargarPropuestas();

      setMensajeExito(
        "Propuesta eliminada correctamente."
      );
    } catch (error) {
      console.error(
        "Error eliminando propuesta:",
        error
      );

      const detalle =
        error?.response?.data?.detalle ||
        error?.response?.data?.error ||
        "No se pudo eliminar la propuesta.";

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
          border:
            "1px solid rgba(25,118,210,0.12)",
          mb: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
            >
              Gestión de Propuestas
            </Typography>

            <Typography color="text.secondary">
              Administre propuestas reales
              registradas en Oracle.
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
              alignSelf: {
                xs: "stretch",
                md: "center",
              },
            }}
          >
            Nueva propuesta
          </Button>
        </Stack>
      </Paper>

      {mensajeError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {mensajeError}
        </Alert>
      )}

      {mensajeExito && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {mensajeExito}
        </Alert>
      )}

      <Paper
        elevation={2}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border:
            "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Propuestas registradas
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total: {propuestas.length}
              </Typography>
            </Box>

            {cargando && (
              <CircularProgress size={26} />
            )}
          </Stack>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    "rgba(25,118,210,0.06)",
                }}
              >
                <TableCell sx={{ fontWeight: 800 }}>
                  Código AIR
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Título
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Tipo
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Es base
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  Propuesta padre
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
              {propuestasOrdenadas.map(
                (propuesta) => (
                  <TableRow
                    key={propuesta.ID_PROPUESTA}
                    hover
                  >
                    <TableCell>
                      {propuesta.CODIGO_AIR}
                    </TableCell>

                    <TableCell>
                      {propuesta.TITULO}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={propuesta.TIPO}
                        size="small"
                        color={
                          propuesta.TIPO ===
                          "BASE"
                            ? "primary"
                            : "secondary"
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          Number(
                            propuesta.ES_BASE
                          ) === 1
                            ? "Sí"
                            : "No"
                        }
                        size="small"
                        color={
                          Number(
                            propuesta.ES_BASE
                          ) === 1
                            ? "success"
                            : "default"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {propuesta.ID_PROPUESTA_PADRE ||
                        "Sin propuesta padre"}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Tooltip title="Editar propuesta">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              abrirEditar(
                                propuesta
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar propuesta">
                          <IconButton
                            color="error"
                            onClick={() =>
                              eliminarPropuestaVista(
                                propuesta.ID_PROPUESTA
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
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
          <Typography
            variant="h5"
            fontWeight={800}
          >
            {modoEdicion
              ? "Editar propuesta"
              : "Nueva propuesta"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Código AIR"
              name="codigo_air"
              value={form.codigo_air}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Título de la propuesta"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              select
              label="Tipo de propuesta"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              fullWidth
            >
              {TIPOS_PROPUESTA.map((tipo) => (
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
              label="¿Es propuesta base?"
              name="es_base"
              value={form.es_base}
              onChange={handleChange}
              fullWidth
            >
              {ES_BASE_OPCIONES.map(
                (opcion) => (
                  <MenuItem
                    key={opcion.value}
                    value={opcion.value}
                  >
                    {opcion.label}
                  </MenuItem>
                )
              )}
            </TextField>

            <TextField
              select
              label="Propuesta padre"
              name="id_propuesta_padre"
              value={form.id_propuesta_padre}
              onChange={handleChange}
              fullWidth
              disabled={
                Number(form.es_base) === 1
              }
              helperText={
                Number(form.es_base) === 1
                  ? "Las propuestas base no pueden tener propuesta padre."
                  : "Seleccione una propuesta padre o deje vacío."
              }
            >
              <MenuItem value="">
                Sin propuesta padre
              </MenuItem>

              {propuestasOrdenadas
                .filter(
                  (propuesta) =>
                    propuesta.ID_PROPUESTA !==
                    idEditando
                )
                .map((propuesta) => (
                  <MenuItem
                    key={
                      propuesta.ID_PROPUESTA
                    }
                    value={
                      propuesta.ID_PROPUESTA
                    }
                  >
                    {propuesta.CODIGO_AIR} -{" "}
                    {propuesta.TITULO}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={cerrarModal}
            disabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarPropuesta}
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : modoEdicion
              ? "Actualizar propuesta"
              : "Guardar propuesta"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Propuestas;