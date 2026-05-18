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

function Nombramientos() {
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [nombramientos, setNombramientos] = useState([
    {
      id: 1,
      asambleista: "Ana Rodríguez",
      sector: "Docente",
      puesto: "Presidenta",
      fechaInicio: "2026-01-01",
      fechaFin: "2026-12-31",
      estado: "Activo",
    },
    {
      id: 2,
      asambleista: "Carlos Méndez",
      sector: "Administrativo",
      puesto: "Secretario",
      fechaInicio: "2026-02-01",
      fechaFin: "2026-11-30",
      estado: "Pendiente",
    },
  ]);

  const [form, setForm] = useState({
    asambleista: "",
    sector: "",
    puesto: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "Pendiente",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const abrirCrear = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      asambleista: "",
      sector: "",
      puesto: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "Pendiente",
    });
    setOpen(true);
  };

  const abrirEditar = (nombramiento) => {
    setModoEdicion(true);
    setIdEditando(nombramiento.id);
    setForm({
      asambleista: nombramiento.asambleista,
      sector: nombramiento.sector,
      puesto: nombramiento.puesto,
      fechaInicio: nombramiento.fechaInicio,
      fechaFin: nombramiento.fechaFin,
      estado: nombramiento.estado,
    });
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      asambleista: "",
      sector: "",
      puesto: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "Pendiente",
    });
  };

  const validarFechas = () => {
    if (!form.fechaInicio || !form.fechaFin) return false;

    const inicio = new Date(form.fechaInicio);
    const fin = new Date(form.fechaFin);

    return fin >= inicio;
  };

  const guardarNombramiento = () => {
    if (
      !form.asambleista ||
      !form.sector ||
      !form.puesto ||
      !form.fechaInicio ||
      !form.fechaFin ||
      !form.estado
    ) {
      alert("Complete todos los campos antes de guardar.");
      return;
    }

    if (!validarFechas()) {
      alert("La fecha final no puede ser menor que la fecha de inicio.");
      return;
    }

    if (modoEdicion) {
      const nombramientosActualizados = nombramientos.map((nombramiento) =>
        nombramiento.id === idEditando
          ? {
              ...nombramiento,
              asambleista: form.asambleista,
              sector: form.sector,
              puesto: form.puesto,
              fechaInicio: form.fechaInicio,
              fechaFin: form.fechaFin,
              estado: form.estado,
            }
          : nombramiento
      );

      setNombramientos(nombramientosActualizados);
    } else {
      const nuevoNombramiento = {
        id: nombramientos.length + 1,
        ...form,
      };

      setNombramientos([...nombramientos, nuevoNombramiento]);
    }

    cerrarModal();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestión de Nombramientos
      </Typography>

      <Button variant="contained" onClick={abrirCrear} sx={{ mb: 3 }}>
        Nuevo nombramiento
      </Button>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Asambleísta</strong></TableCell>
              <TableCell><strong>Sector</strong></TableCell>
              <TableCell><strong>Puesto</strong></TableCell>
              <TableCell><strong>Fecha inicio</strong></TableCell>
              <TableCell><strong>Fecha fin</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {nombramientos.map((nombramiento) => (
              <TableRow key={nombramiento.id}>
                <TableCell>{nombramiento.asambleista}</TableCell>
                <TableCell>{nombramiento.sector}</TableCell>
                <TableCell>{nombramiento.puesto}</TableCell>
                <TableCell>{nombramiento.fechaInicio}</TableCell>
                <TableCell>{nombramiento.fechaFin}</TableCell>
                <TableCell>{nombramiento.estado}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEditar(nombramiento)}
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
            {modoEdicion ? "Editar nombramiento" : "Nuevo nombramiento"}
          </Typography>

          <TextField
            fullWidth
            label="Nombre del asambleísta"
            name="asambleista"
            value={form.asambleista}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="Sector"
            name="sector"
            value={form.sector}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Docente">Docente</MenuItem>
            <MenuItem value="Administrativo">Administrativo</MenuItem>
            <MenuItem value="Estudiantil">Estudiantil</MenuItem>
            <MenuItem value="Egresado">Egresado</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Puesto"
            name="puesto"
            value={form.puesto}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Presidente">Presidente</MenuItem>
            <MenuItem value="Presidenta">Presidenta</MenuItem>
            <MenuItem value="Secretario">Secretario</MenuItem>
            <MenuItem value="Secretaria">Secretaria</MenuItem>
            <MenuItem value="Representante">Representante</MenuItem>
            <MenuItem value="Suplente">Suplente</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Fecha de inicio"
            name="fechaInicio"
            value={form.fechaInicio}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            type="date"
            label="Fecha de fin"
            name="fechaFin"
            value={form.fechaFin}
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
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Finalizado">Finalizado</MenuItem>
            <MenuItem value="Anulado">Anulado</MenuItem>
          </TextField>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={cerrarModal}>
              Cancelar
            </Button>

            <Button variant="contained" onClick={guardarNombramiento}>
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

export default Nombramientos;