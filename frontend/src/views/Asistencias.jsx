import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import api from "../controllers/api";

function Asistencias() {
  const [sesiones, setSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarSesiones();
  }, []);

  async function cargarSesiones() {
    try {
      setError("");
      const response = await api.get("/sesiones");
      setSesiones(response.data || []);
    } catch (error) {
      console.error(error);
      setError("Error cargando sesiones.");
    }
  }

  async function cargarAsistencias(idSesion) {
    try {
      setError("");
      setMensaje("");
      const response = await api.get(`/asistencias/sesion/${idSesion}`);
      setAsistencias(response.data || []);
    } catch (error) {
      console.error(error);
      setError(
        error?.response?.data?.detalle ||
          error?.response?.data?.error ||
          "Error cargando asistencias."
      );
    }
  }

  async function cambiarAsistencia(asistencia) {
    try {
      setError("");
      setMensaje("");

      const nuevoValor = Number(asistencia.ASISTIO) === 1 ? 0 : 1;

      if (asistencia.ID_ASISTENCIA) {
        await api.put(`/asistencias/${asistencia.ID_ASISTENCIA}`, {
          asistio: nuevoValor,
        });
      } else {
        await api.post("/asistencias", {
          id_nombramiento: asistencia.ID_NOMBRAMIENTO,
          id_sesion: sesionSeleccionada,
          asistio: nuevoValor,
        });
      }

      setMensaje("Asistencia actualizada correctamente.");
      await cargarAsistencias(sesionSeleccionada);
    } catch (error) {
      console.error(error);
      setError(
        error?.response?.data?.detalle ||
          error?.response?.data?.error ||
          "Error guardando asistencia."
      );
    }
  }

  function manejarCambioSesion(event) {
    const idSesion = event.target.value;
    setSesionSeleccionada(idSesion);
    cargarAsistencias(idSesion);
  }

  const total = asistencias.length;
  const presentes = asistencias.filter((a) => Number(a.ASISTIO) === 1).length;
  const ausentes = total - presentes;

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
          mb: 3,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.10), rgba(255,255,255,1))",
          border: "1px solid rgba(25,118,210,0.12)",
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Gestión de Asistencias
        </Typography>

        <Typography color="text.secondary">
          Seleccione una sesión y registre la participación de los nombramientos vigentes.
        </Typography>
      </Paper>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Sesión</InputLabel>

          <Select
            value={sesionSeleccionada}
            label="Sesión"
            onChange={manejarCambioSesion}
          >
            {sesiones.map((sesion) => (
              <MenuItem key={sesion.ID_SESION} value={sesion.ID_SESION}>
                {sesion.NUMERO
                  ? `Sesión ${sesion.NUMERO}`
                  : `Sesión ${sesion.ID_SESION}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {sesionSeleccionada && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Chip label={`Total: ${total}`} />
          <Chip label={`Presentes: ${presentes}`} color="success" />
          <Chip label={`Ausentes: ${ausentes}`} color="error" />
        </Stack>
      )}

      <Paper
        elevation={2}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(25,118,210,0.06)" }}>
              <TableCell sx={{ fontWeight: 800 }}>Asambleísta</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Puesto</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                Acción
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!sesionSeleccionada && (
              <TableRow>
                <TableCell colSpan={4}>
                  Seleccione una sesión para registrar asistencia.
                </TableCell>
              </TableRow>
            )}

            {sesionSeleccionada && asistencias.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  No hay nombramientos vigentes disponibles.
                </TableCell>
              </TableRow>
            )}

            {asistencias.map((asistencia) => (
              <TableRow
                key={
                  asistencia.ID_ASISTENCIA ||
                  `${asistencia.ID_NOMBRAMIENTO}-${asistencia.ID_SESION}`
                }
                hover
              >
                <TableCell>{asistencia.NOMBRE_ASAMBLEISTA}</TableCell>
                <TableCell>{asistencia.PUESTO || "Sin puesto"}</TableCell>

                <TableCell>
                  <Chip
                    label={Number(asistencia.ASISTIO) === 1 ? "PRESENTE" : "AUSENTE"}
                    color={Number(asistencia.ASISTIO) === 1 ? "success" : "error"}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <Button
                    variant="contained"
                    color={Number(asistencia.ASISTIO) === 1 ? "error" : "success"}
                    onClick={() => cambiarAsistencia(asistencia)}
                  >
                    {Number(asistencia.ASISTIO) === 1
                      ? "Marcar ausente"
                      : "Marcar presente"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default Asistencias;