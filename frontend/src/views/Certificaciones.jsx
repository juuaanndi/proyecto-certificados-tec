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

function Certificaciones() {
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [certificaciones, setCertificaciones] = useState([
    {
      id: 1,
      folio: "DAIR-001-2026",
      asambleista: "Ana Rodríguez",
      tipo: "Participación",
      fecha: "2026-05-17",
      estado: "Emitida",
      hash: "SHA-256",
    },
    {
      id: 2,
      folio: "DAIR-002-2026",
      asambleista: "Carlos Méndez",
      tipo: "Asistencia",
      fecha: "2026-05-18",
      estado: "Pendiente",
      hash: "Sin generar",
    },
  ]);

  const [form, setForm] = useState({
    asambleista: "",
    tipo: "",
    fecha: "",
    estado: "Pendiente",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generarFolio = () => {
    const fechaSeleccionada = form.fecha ? new Date(form.fecha) : new Date();
    const anio = fechaSeleccionada.getFullYear();

    const certificacionesDelAnio = certificaciones.filter((cert) =>
      cert.folio.endsWith(`-${anio}`)
    );

    const siguiente = certificacionesDelAnio.length + 1;

    return `DAIR-${String(siguiente).padStart(3, "0")}-${anio}`;
  };

  const generarHash = (estado) => {
    return estado === "Emitida" ? "SHA-256" : "Sin generar";
  };

  const abrirCrear = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      asambleista: "",
      tipo: "",
      fecha: "",
      estado: "Pendiente",
    });
    setOpen(true);
  };

  const abrirEditar = (certificacion) => {
    setModoEdicion(true);
    setIdEditando(certificacion.id);
    setForm({
      asambleista: certificacion.asambleista,
      tipo: certificacion.tipo,
      fecha: certificacion.fecha,
      estado: certificacion.estado,
    });
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setModoEdicion(false);
    setIdEditando(null);
    setForm({
      asambleista: "",
      tipo: "",
      fecha: "",
      estado: "Pendiente",
    });
  };

  const guardarCertificacion = () => {
    if (!form.asambleista || !form.tipo || !form.fecha || !form.estado) {
      alert("Complete todos los campos antes de guardar.");
      return;
    }

    if (modoEdicion) {
      const certificacionesActualizadas = certificaciones.map((cert) =>
        cert.id === idEditando
          ? {
              ...cert,
              asambleista: form.asambleista,
              tipo: form.tipo,
              fecha: form.fecha,
              estado: form.estado,
              hash: generarHash(form.estado),
            }
          : cert
      );

      setCertificaciones(certificacionesActualizadas);
    } else {
      const nuevaCertificacion = {
        id: certificaciones.length + 1,
        folio: generarFolio(),
        ...form,
        hash: generarHash(form.estado),
      };

      setCertificaciones([...certificaciones, nuevaCertificacion]);
    }

    cerrarModal();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Gestión de Certificaciones
      </Typography>

      <Button variant="contained" onClick={abrirCrear} sx={{ mb: 3 }}>
        Nueva certificación
      </Button>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Folio</strong></TableCell>
              <TableCell><strong>Asambleísta</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Hash</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {certificaciones.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>{cert.folio}</TableCell>
                <TableCell>{cert.asambleista}</TableCell>
                <TableCell>{cert.tipo}</TableCell>
                <TableCell>{cert.fecha}</TableCell>
                <TableCell>{cert.estado}</TableCell>
                <TableCell>{cert.hash}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                    PDF
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEditar(cert)}
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
            {modoEdicion ? "Editar certificación" : "Nueva certificación"}
          </Typography>

          <TextField
            fullWidth
            label="Folio"
            value={
              modoEdicion
                ? certificaciones.find((c) => c.id === idEditando)?.folio || ""
                : generarFolio()
            }
            margin="normal"
            disabled
          />

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
            label="Tipo de certificación"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="Participación">Participación</MenuItem>
            <MenuItem value="Asistencia">Asistencia</MenuItem>
            <MenuItem value="Nombramiento">Nombramiento</MenuItem>
            <MenuItem value="Resolución">Resolución</MenuItem>
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
            <MenuItem value="Emitida">Emitida</MenuItem>
            <MenuItem value="Anulada">Anulada</MenuItem>
          </TextField>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={cerrarModal}>
              Cancelar
            </Button>

            <Button variant="contained" onClick={guardarCertificacion}>
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
  width: 500,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

export default Certificaciones;