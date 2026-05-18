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

function Propuestas() {
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [propuestas, setPropuestas] = useState([
    {
      id: 1,
      codigo: "PROP-001-2026",
      titulo: "Actualización Reglamento Interno",
      proponente: "Ana Rodríguez",
      tipo: "Reforma",
      etapa: "Procedencia",
      fecha: "2026-05-15",
      estado: "En revisión",
    },
    {
      id: 2,
      codigo: "PROP-002-2026",
      titulo: "Nueva Comisión Académica",
      proponente: "Carlos Méndez",
      tipo: "Creación",
      etapa: "Aprobación",
      fecha: "2026-05-16",
      estado: "Aprobada",
    },
  ]);

  const [form, setForm] = useState({
    titulo: "",
    proponente: "",
    tipo: "",
    etapa: "",
    fecha: "",
    estado: "Pendiente",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generarCodigo = () => {
    const fechaSeleccionada = form.fecha ? new Date(form.fecha) : new Date();
    const anio = fechaSeleccionada.getFullYear();

    const propuestasDelAnio = propuestas.filter((propuesta) =>
      propuesta.codigo.endsWith(`-${anio}`)
    );

    const siguiente = propuestasDelAnio.length + 1;

    return `PROP-${String(siguiente).padStart(3, "0")}-${anio}`;
  };

  const abrirCrear = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      titulo: "",
      proponente: "",
      tipo: "",
      etapa: "",
      fecha: "",
      estado: "Pendiente",
    });
    setOpen(true);
  };

  const abrirEditar = (propuesta) => {
    setModoEdicion(true);
    setIdEditando(propuesta.id);
    setForm({
      titulo: propuesta.titulo,
      proponente: propuesta.proponente,
      tipo: propuesta.tipo,
      etapa: propuesta.etapa,
      fecha: propuesta.fecha,
      estado: propuesta.estado,
    });
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      titulo: "",
      proponente: "",
      tipo: "",
      etapa: "",
      fecha: "",
      estado: "Pendiente",
    });
  };

  const guardarPropuesta = () => {
    if (
      !form.titulo ||
      !form.proponente ||
      !form.tipo ||
      !form.etapa ||
      !form.fecha ||
      !form.estado
    ) {
      alert("Complete todos los campos antes de guardar.");
      return;
    }

    if (modoEdicion) {
      const propuestasActualizadas = propuestas.map((propuesta) =>
        propuesta.id === idEditando
          ? {
              ...propuesta,
              titulo: form.titulo,
              proponente: form.proponente,
              tipo: form.tipo,
              etapa: form.etapa,
              fecha: form.fecha,
              estado: form.estado,
            }
          : propuesta
      );

      setPropuestas(propuestasActualizadas);
    } else {
      const nuevaPropuesta = {
        id: propuestas.length + 1,
        codigo: generarCodigo(),
        ...form,
      };

      setPropuestas([...propuestas, nuevaPropuesta]);
    }

    cerrarModal();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestión de Propuestas
      </Typography>

      <Button variant="contained" onClick={abrirCrear} sx={{ mb: 3 }}>
        Nueva propuesta
      </Button>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Código</strong></TableCell>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Proponente</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Etapa</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {propuestas.map((propuesta) => (
              <TableRow key={propuesta.id}>
                <TableCell>{propuesta.codigo}</TableCell>
                <TableCell>{propuesta.titulo}</TableCell>
                <TableCell>{propuesta.proponente}</TableCell>
                <TableCell>{propuesta.tipo}</TableCell>
                <TableCell>{propuesta.etapa}</TableCell>
                <TableCell>{propuesta.fecha}</TableCell>
                <TableCell>{propuesta.estado}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEditar(propuesta)}
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
            {modoEdicion ? "Editar propuesta" : "Nueva propuesta"}
          </Typography>

          <TextField
            fullWidth
            label="Código"
            value={
              modoEdicion
                ? propuestas.find((p) => p.id === idEditando)?.codigo || ""
                : generarCodigo()
            }
            margin="normal"
            disabled
          />

          <TextField
            fullWidth
            label="Título de la propuesta"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Proponente"
            name="proponente"
            value={form.proponente}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="Tipo de propuesta"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Reforma">Reforma</MenuItem>
            <MenuItem value="Creación">Creación</MenuItem>
            <MenuItem value="Derogación">Derogación</MenuItem>
            <MenuItem value="Modificación">Modificación</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Etapa"
            name="etapa"
            value={form.etapa}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Procedencia">Procedencia</MenuItem>
            <MenuItem value="Aprobación">Aprobación</MenuItem>
            <MenuItem value="Dictamen">Dictamen</MenuItem>
            <MenuItem value="Comisión">Comisión</MenuItem>
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
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="En revisión">En revisión</MenuItem>
            <MenuItem value="Aprobada">Aprobada</MenuItem>
            <MenuItem value="Rechazada">Rechazada</MenuItem>
          </TextField>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={cerrarModal}>
              Cancelar
            </Button>

            <Button variant="contained" onClick={guardarPropuesta}>
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
  width: 560,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export default Propuestas;