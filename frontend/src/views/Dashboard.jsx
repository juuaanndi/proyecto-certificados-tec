import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BadgeIcon from "@mui/icons-material/Badge";
import DescriptionIcon from "@mui/icons-material/Description";

import api from "../controllers/api";

function StatCard({ title, value, icon }) {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 4,
        height: "100%",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="h3" fontWeight={900}>
              {value}
            </Typography>
          </Box>

          <Box sx={{ opacity: 0.75 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setCargando(true);
      setError("");

      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detalle ||
          "No se pudo cargar la información del dashboard."
      );
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
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
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.12), rgba(255,255,255,1))",
          border: "1px solid rgba(25,118,210,0.12)",
          mb: 3,
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Dashboard AIR TEC
        </Typography>

        <Typography color="text.secondary">
          Resumen ejecutivo del sistema integrado con Oracle.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Sesiones"
            value={data?.resumen?.sesiones || 0}
            icon={<EventIcon fontSize="large" color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Propuestas"
            value={data?.resumen?.propuestas || 0}
            icon={<AssignmentIcon fontSize="large" color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Nombramientos vigentes"
            value={data?.resumen?.nombramientosVigentes || 0}
            icon={<BadgeIcon fontSize="large" color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Certificaciones"
            value={data?.resumen?.certificaciones || 0}
            icon={<DescriptionIcon fontSize="large" color="primary" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={800}>
                Últimas certificaciones
              </Typography>

              <Typography color="text.secondary">
                Documentos emitidos recientemente.
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(25,118,210,0.06)" }}>
                    <TableCell>Documento</TableCell>
                    <TableCell>Asambleísta</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(data?.ultimasCertificaciones || []).map((c) => (
                    <TableRow key={c.ID_CERTIFICACION}>
                      <TableCell>{c.NUMERO_DOCUMENTO}</TableCell>
                      <TableCell>{c.NOMBRE_ASAMBLEISTA}</TableCell>
                      <TableCell>
                        <Chip
                          label={c.ESTADO}
                          color={c.ESTADO === "VIGENTE" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {(data?.ultimasCertificaciones || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>Sin certificaciones.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={800}>
                Últimos nombramientos
              </Typography>

              <Typography color="text.secondary">
                Registros activos o recientes.
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(25,118,210,0.06)" }}>
                    <TableCell>Asambleísta</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(data?.ultimosNombramientos || []).map((n) => (
                    <TableRow key={n.ID_NOMBRAMIENTO}>
                      <TableCell>{n.NOMBRE_ASAMBLEISTA}</TableCell>
                      <TableCell>{n.NOMBRE_SECTOR}</TableCell>
                      <TableCell>
                        <Chip
                          label={n.ESTADO}
                          color={n.ESTADO === "VIGENTE" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {(data?.ultimosNombramientos || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>Sin nombramientos.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;