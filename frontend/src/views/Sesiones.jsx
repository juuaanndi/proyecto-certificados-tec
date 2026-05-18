import { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import api from "../controllers/api";

function Sesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const [form, setForm] = useState({
    tipo: "",
    fecha: "",
    estado: "Programada",
  });

  useEffect(() => {
    cargarSesiones();
  }, []);

  const cargarSesiones = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const response = await api.get("/sesiones");
      setSesiones(response.data);
    } catch (error) {
      console.error("Error cargando sesiones:", error);
      setMensajeError("No se pudieron cargar las sesiones desde el backend.");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generarNumeroSesion = () => {
    const fechaSeleccionada = form.fecha ? new Date(form.fecha) : new Date();
    const anio = fechaSeleccionada.getFullYear();

    const sesionesDelAnio = sesiones.filter((sesion) => {
      const numero = sesion.numero || sesion.numero_sesion || "";
      return numero.endsWith(`-${anio}`);
    });

    const siguiente = sesionesDelAnio.length + 1;
    return `AIR-${String(siguiente).padStart(3, "0")}-${anio}`;
  };

  const abrirCrear = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      tipo: "",
      fecha: "",
      estado: "Programada",
    });
    setOpen(true);
  };

  const abrirEditar = (sesion) => {
    setModoEdicion(true);
    setIdEditando(sesion.id || sesion.id_sesion);

    setForm({
      tipo: sesion.tipo || sesion.tipo_sesion || "",
      fecha: sesion.fecha || sesion.fecha_sesion || "",
      estado: sesion.estado || "Programada",
    });

    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      tipo: "",
      fecha: "",
      estado: "Programada",
    });
  };

  const guardarSesion = async () => {
    if (!form.tipo || !form.fecha || !form.estado) {
      alert("Complete todos los campos antes de guardar.");
      return;
    }

    const datosSesion = {
      numero: modoEdicion ? undefined : generarNumeroSesion(),
      tipo: form.tipo,
      fecha: form.fecha,
      estado: form.estado,
    };

    try {
      setMensajeError("");

      if (modoEdicion) {
        await api.put(`/sesiones/${idEditando}`, {
          tipo: form.tipo,
          fecha: form.fecha,
          estado: form.estado,
        });
      } else {
        await api.post("/sesiones", datosSesion);
      }

      cerrarModal();
      cargarSesiones();
    } catch (error) {
      console.error("Error guardando sesión:", error);
      setMensajeError("No se pudo guardar la sesión en el backend.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestión de Sesiones
      </Typography>

      {mensajeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mensajeError}
        </Alert>
      )}

      <Button variant="contained" onClick={abrirCrear} sx={{ mb: 3 }}>
        Crear sesión
      </Button>

      <Paper elevation={2}>
        {cargando ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Número</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sesiones.map((sesion) => (
                <TableRow key={sesion.id || sesion.id_sesion}>
                  <TableCell>{sesion.numero || sesion.numero_sesion}</TableCell>
                  <TableCell>{sesion.tipo || sesion.tipo_sesion}</TableCell>
                  <TableCell>{sesion.fecha || sesion.fecha_sesion}</TableCell>
                  <TableCell>{sesion.estado}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => abrirEditar(sesion)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {sesiones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay sesiones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Modal open={open} onClose={cerrarModal}>
        <Box sx={modalStyle}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {modoEdicion ? "Editar sesión" : "Nueva sesión"}
          </Typography>

          <TextField
            fullWidth
            label="Número de sesión"
            value={modoEdicion ? "No editable" : generarNumeroSesion()}
            margin="normal"
            disabled
          />

          <TextField
            select
            fullWidth
            label="Tipo de sesión"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Ordinaria">Ordinaria</MenuItem>
            <MenuItem value="Extraordinaria">Extraordinaria</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Fecha"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            fullWidth
            label="Estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Programada">Programada</MenuItem>
            <MenuItem value="En revisión">En revisión</MenuItem>
            <MenuItem value="Finalizada">Finalizada</MenuItem>
            <MenuItem value="Cancelada">Cancelada</MenuItem>
          </TextField>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={cerrarModal}>
              Cancelar
            </Button>

            <Button variant="contained" onClick={guardarSesion}>
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 520,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export default Sesiones;