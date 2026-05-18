import { useState } from "react";
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
} from "@mui/material";

function Sesiones() {
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [sesiones, setSesiones] = useState([
    {
      id: 1,
      numero: "AIR-001-2026",
      tipo: "Ordinaria",
      fecha: "2026-05-17",
      estado: "Programada",
    },
    {
      id: 2,
      numero: "AIR-002-2026",
      tipo: "Extraordinaria",
      fecha: "2026-05-24",
      estado: "En revisión",
    },
  ]);

  const [form, setForm] = useState({
    tipo: "",
    fecha: "",
    estado: "Programada",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generarNumeroSesion = () => {
    const fechaSeleccionada = form.fecha ? new Date(form.fecha) : new Date();
    const anio = fechaSeleccionada.getFullYear();

    const sesionesDelAnio = sesiones.filter((sesion) =>
      sesion.numero.endsWith(`-${anio}`)
    );

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
    setIdEditando(sesion.id);
    setForm({
      tipo: sesion.tipo,
      fecha: sesion.fecha,
      estado: sesion.estado,
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

  const guardarSesion = () => {
    if (!form.tipo || !form.fecha || !form.estado) {
      alert("Complete todos los campos antes de guardar.");
      return;
    }

    if (modoEdicion) {
      const sesionesActualizadas = sesiones.map((sesion) =>
        sesion.id === idEditando
          ? {
              ...sesion,
              tipo: form.tipo,
              fecha: form.fecha,
              estado: form.estado,
            }
          : sesion
      );

      setSesiones(sesionesActualizadas);
    } else {
      const nuevaSesion = {
        id: sesiones.length + 1,
        numero: generarNumeroSesion(),
        ...form,
      };

      setSesiones([...sesiones, nuevaSesion]);
    }

    cerrarModal();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestión de Sesiones
      </Typography>

      <Button variant="contained" onClick={abrirCrear} sx={{ mb: 3 }}>
        Crear sesión
      </Button>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Número</strong>
              </TableCell>
              <TableCell>
                <strong>Tipo</strong>
              </TableCell>
              <TableCell>
                <strong>Fecha</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Acciones</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sesiones.map((sesion) => (
              <TableRow key={sesion.id}>
                <TableCell>{sesion.numero}</TableCell>
                <TableCell>{sesion.tipo}</TableCell>
                <TableCell>{sesion.fecha}</TableCell>
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
          </TableBody>
        </Table>
      </Paper>

      <Modal open={open} onClose={cerrarModal}>
        <Box sx={modalStyle}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {modoEdicion ? "Editar sesión" : "Nueva sesión"}
          </Typography>

          <TextField
            fullWidth
            label="Número de sesión"
            value={
              modoEdicion
                ? sesiones.find((s) => s.id === idEditando)?.numero || ""
                : generarNumeroSesion()
            }
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
            <MenuItem value="Urgente">Urgente</MenuItem>
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
  width: 450,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export default Sesiones;