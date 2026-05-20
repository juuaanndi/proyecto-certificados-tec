import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import api from "../controllers/api";

const tipos = [
  "REGLAMENTO",
  "TITULO",
  "CAPITULO",
  "ARTICULO",
  "INCISO",
];

const estados = [
  "VIGENTE",
  "HISTORICA",
];

const formInicial = {
  id_padre: "",
  tipo: "REGLAMENTO",
  titulo: "",
  contenido: "",
  orden: "",
  estado_vigencia: "VIGENTE",
  fecha_inicio_vigencia: "",
  fecha_fin_vigencia: "",
  origen: "",
};

function Normativa() {
  const [elementos, setElementos] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idActual, setIdActual] = useState(null);

  const [form, setForm] = useState(formInicial);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarElementos();
  }, []);

  async function cargarElementos() {
    try {
      const response = await api.get("/normativa");
      setElementos(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Error cargando normativa.");
    }
  }

  function abrirCrear() {
    setModoEdicion(false);
    setIdActual(null);
    setForm({
      ...formInicial,
      fecha_inicio_vigencia: new Date()
        .toISOString()
        .split("T")[0],
    });
    setOpen(true);
  }

  function abrirEditar(elemento) {
    setModoEdicion(true);
    setIdActual(elemento.ID_ELEMENTO);

    setForm({
      id_padre: elemento.ID_PADRE || "",
      tipo: elemento.TIPO || "REGLAMENTO",
      titulo: elemento.TITULO || "",
      contenido: elemento.CONTENIDO || "",
      orden: elemento.ORDEN || "",
      estado_vigencia:
        elemento.ESTADO_VIGENCIA || "VIGENTE",
      fecha_inicio_vigencia:
        elemento.FECHA_INICIO_VIGENCIA || "",
      fecha_fin_vigencia:
        elemento.FECHA_FIN_VIGENCIA || "",
      origen: elemento.ORIGEN || "",
    });

    setOpen(true);
  }

  function cerrarModal() {
    setOpen(false);
    setForm(formInicial);
    setModoEdicion(false);
    setIdActual(null);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function guardarElemento() {
    try {
      setMensaje("");
      setError("");

      if (modoEdicion) {
        await api.put(`/normativa/${idActual}`, form);

        setMensaje(
          "Elemento normativo actualizado correctamente."
        );
      } else {
        console.log(form);
        await api.post("/normativa", form);

        setMensaje(
          "Elemento normativo creado correctamente."
        );
      }

      cerrarModal();
      cargarElementos();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
          "Error guardando normativa."
      );
    }
  }

  async function eliminarElemento(id) {
    const confirmar = window.confirm(
      "¿Desea eliminar este elemento normativo?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/normativa/${id}`);

      setMensaje(
        "Elemento normativo eliminado correctamente."
      );

      cargarElementos();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
          "Error eliminando elemento."
      );
    }
  }

  async function nuevaVersion(elemento) {
    const contenido = prompt(
      "Ingrese el nuevo contenido de la versión:"
    );

    if (!contenido) return;

    try {
      await api.post(
        `/normativa/${elemento.ID_ELEMENTO}/nueva-version`,
        {
          titulo: elemento.TITULO,
          contenido,
          fecha_inicio_vigencia: new Date()
            .toISOString()
            .split("T")[0],
          origen: "Nueva versión desde sistema",
        }
      );

      setMensaje(
        "Nueva versión normativa publicada."
      );

      cargarElementos();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
          "Error creando nueva versión."
      );
    }
  }

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
          p: 4,
          mb: 3,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(255,255,255,1))",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h3" fontWeight={900}>
              Gestión Normativa
            </Typography>

            <Typography color="text.secondary">
              Administre reglamentos,
              capítulos, artículos e incisos.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={abrirCrear}
          >
            Nuevo elemento
          </Button>
        </Stack>
      </Paper>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Padre</TableCell>
              <TableCell>Orden</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {elementos.map((e) => (
              <TableRow key={e.ID_ELEMENTO}>
                <TableCell>{e.TIPO}</TableCell>

                <TableCell>
                  {e.TITULO || "Sin título"}
                </TableCell>

                <TableCell>
                  <Chip
                    label={e.ESTADO_VIGENCIA}
                    color={
                      e.ESTADO_VIGENCIA === "VIGENTE"
                        ? "success"
                        : "default"
                    }
                  />
                </TableCell>

                <TableCell>
                  {e.ID_PADRE || "-"}
                </TableCell>

                <TableCell>
                  {e.ORDEN || "-"}
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => abrirEditar(e)}
                    >
                      Editar
                    </Button>

                    <Button
                      size="small"
                      color="warning"
                      variant="outlined"
                      onClick={() => nuevaVersion(e)}
                    >
                      Nueva versión
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        eliminarElemento(
                          e.ID_ELEMENTO
                        )
                      }
                    >
                      Eliminar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {elementos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  No hay elementos normativos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={open}
        onClose={cerrarModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {modoEdicion
            ? "Editar elemento normativo"
            : "Nuevo elemento normativo"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              fullWidth
            >
              {tipos.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Título"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Contenido"
              name="contenido"
              value={form.contenido}
              onChange={handleChange}
              multiline
              minRows={5}
              fullWidth
            />

            <TextField
              label="ID Padre"
              name="id_padre"
              value={form.id_padre}
              onChange={handleChange}
              type="number"
              fullWidth
            />

            <TextField
              label="Orden"
              name="orden"
              value={form.orden}
              onChange={handleChange}
              type="number"
              fullWidth
            />

            <TextField
              select
              label="Estado"
              name="estado_vigencia"
              value={form.estado_vigencia}
              onChange={handleChange}
              fullWidth
            >
              {estados.map((estado) => (
                <MenuItem
                  key={estado}
                  value={estado}
                >
                  {estado}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Inicio vigencia"
              name="fecha_inicio_vigencia"
              value={form.fecha_inicio_vigencia}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <TextField
              type="date"
              label="Fin vigencia"
              name="fecha_fin_vigencia"
              value={form.fecha_fin_vigencia}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <TextField
              label="Origen"
              name="origen"
              value={form.origen}
              onChange={handleChange}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarModal}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={guardarElemento}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Normativa;