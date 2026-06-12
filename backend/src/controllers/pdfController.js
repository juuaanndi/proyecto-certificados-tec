const PDFDocument = require("pdfkit");
const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

function valorSeguro(valor, texto = "No registrado") {
  if (valor === null || valor === undefined || valor === "") return texto;
  return valor;
}

function fechaSegura(fecha) {
  if (!fecha) return "No registrada";

  try {
    return new Date(fecha).toLocaleDateString("es-CR");
  } catch {
    return "No registrada";
  }
}

async function generarCertificadoPDF(req, res) {
  const { id } = req.params;
  let connection;

  try {
    connection = await getConnection();

    const certResult = await connection.execute(
      `
      SELECT
        C.ID_CERTIFICACION,
        C.NUMERO_DOCUMENTO,
        C.FECHA_EMISION,
        C.ESTADO AS ESTADO_CERTIFICACION,
        C.DESCRIPCION_MOTIVO_ANULADO,
        U.USERNAME AS USUARIO_EMISOR,
        A.NOMBRE AS NOMBRE_ASAMBLEISTA,
        A.CEDULA,
        A.CORREO,
        N.ID_NOMBRAMIENTO,
        N.PUESTO,
        N.CONDICION,
        N.INICIO,
        N.FIN,
        N.ESTADO AS ESTADO_NOMBRAMIENTO,
        S.NOMBRE AS NOMBRE_SECTOR,
        P.NOMBRE AS NOMBRE_PERIODO
      FROM CERTIFICACION C
      JOIN NOMBRAMIENTO N
        ON C.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
      JOIN ASAMBLEISTA A
        ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
      JOIN SECTOR S
        ON N.ID_SECTOR = S.ID_SECTOR
      JOIN PERIODO_AIR P
        ON N.ID_PERIODO = P.ID_PERIODO
      LEFT JOIN USUARIO U
        ON C.ID_USUARIO_EMISOR = U.ID_USUARIO
      WHERE C.ID_CERTIFICACION = :id
      `,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!certResult.rows.length) {
      return res.status(404).json({ error: "Certificación no encontrada" });
    }

    const cert = certResult.rows[0];
    const idNombramiento = cert.ID_NOMBRAMIENTO;

    const sesionesResult = await connection.execute(
      `
      SELECT
        COUNT(*) AS TOTAL_SESIONES,
        NVL(SUM(CASE WHEN ASISTIO = 1 THEN 1 ELSE 0 END), 0) AS SESIONES_ASISTIDAS
      FROM ASISTENCIA
      WHERE ID_NOMBRAMIENTO = :id
      `,
      { id: Number(idNombramiento) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const sesiones = sesionesResult.rows[0] || {
      TOTAL_SESIONES: 0,
      SESIONES_ASISTIDAS: 0,
    };

    let comisiones = [];
    try {
      const comisionesResult = await connection.execute(
        `
        SELECT CT.NOMBRE AS NOMBRE_COMISION, IC.INICIO, IC.FIN
        FROM INTEGRANTE_COMISION IC
        JOIN COMISION_TRABAJO CT
          ON IC.ID_COMISION = CT.ID_COMISION
        WHERE IC.ID_NOMBRAMIENTO = :id
        `,
        { id: Number(idNombramiento) },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      comisiones = comisionesResult.rows || [];
    } catch (error) {
      console.warn("No se pudieron cargar comisiones para el PDF:", error.message);
      comisiones = [];
    }

    let propuestas = [];
    try {
      const propuestasResult = await connection.execute(
        `
        SELECT P.TITULO, P.CODIGO_AIR, P.TIPO
        FROM PROPOSITOR PR
        JOIN PROPUESTA P
          ON PR.ID_PROPUESTA = P.ID_PROPUESTA
        WHERE PR.ID_NOMBRAMIENTO = :id
        `,
        { id: Number(idNombramiento) },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      propuestas = propuestasResult.rows || [];
    } catch (error) {
      console.warn("No se pudieron cargar propuestas para el PDF:", error.message);
      propuestas = [];
    }

    const integrantesMap = {};

    for (const comision of comisiones) {
      try {
        const intResult = await connection.execute(
          `
          SELECT A.NOMBRE
          FROM INTEGRANTE_COMISION IC
          JOIN NOMBRAMIENTO N
            ON IC.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
          JOIN ASAMBLEISTA A
            ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
          JOIN COMISION_TRABAJO CT
            ON IC.ID_COMISION = CT.ID_COMISION
          WHERE CT.NOMBRE = :nombre
          `,
          { nombre: comision.NOMBRE_COMISION },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        integrantesMap[comision.NOMBRE_COMISION] = intResult.rows.map(
          (r) => r.NOMBRE
        );
      } catch (error) {
        integrantesMap[comision.NOMBRE_COMISION] = [];
      }
    }

    const doc = new PDFDocument({ margin: 70, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${cert.NUMERO_DOCUMENTO || "certificacion"}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("DIRECTORIO DE LA ASAMBLEA INSTITUCIONAL REPRESENTATIVA", {
        align: "center",
      });

    doc.text("CONSTANCIA", { align: "center" });
    doc.text(valorSeguro(cert.NUMERO_DOCUMENTO, "Documento no registrado"), {
      align: "center",
    });

    if (cert.ESTADO_CERTIFICACION === "ANULADA") {
      doc.moveDown(0.8);
      doc
        .fontSize(13)
        .fillColor("red")
        .font("Helvetica-Bold")
        .text("CERTIFICACIÓN ANULADA", { align: "center" });
      doc.fillColor("black");
    }

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        "El Directorio de la Asamblea Institucional Representativa hace constar que:",
        { align: "justify" }
      );

    doc.moveDown();

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(valorSeguro(cert.NOMBRE_ASAMBLEISTA), { align: "center" });

    doc.text(`Cédula de identidad Nº ${valorSeguro(cert.CEDULA)}`, {
      align: "center",
    });

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(
        "De acuerdo con los registros de la Secretaría de la AIR, la persona indicada cuenta con la siguiente información registrada en el sistema:",
        { align: "justify" }
      );

    doc.moveDown(0.8);

    const estadoNombramiento = valorSeguro(cert.ESTADO_NOMBRAMIENTO);
    const fechaInicio = fechaSegura(cert.INICIO);
    const fechaFin =
      cert.FIN && cert.ESTADO_NOMBRAMIENTO !== "VIGENTE"
        ? fechaSegura(cert.FIN)
        : "Sin fecha fin";

    doc
      .font("Helvetica-Oblique")
      .text(
        `• Sector: ${valorSeguro(cert.NOMBRE_SECTOR)}. Puesto o representación: ${valorSeguro(
          cert.PUESTO
        )}. Condición: ${valorSeguro(cert.CONDICION)}. Estado del nombramiento: ${estadoNombramiento}. Vigencia: ${fechaInicio} - ${fechaFin}.`,
        { indent: 20, align: "justify" }
      );

    doc.moveDown();

    doc
      .font("Helvetica")
      .text(
        `Según consta en los registros de asistencia, se reporta participación en ${valorSeguro(
          sesiones.SESIONES_ASISTIDAS,
          0
        )} de ${valorSeguro(sesiones.TOTAL_SESIONES, 0)} sesiones registradas para este nombramiento.`,
        { align: "justify" }
      );

    doc.moveDown();

    if (comisiones.length > 0) {
      doc.text("Participación en comisiones:", { align: "justify" });
      doc.moveDown(0.5);

      for (const comision of comisiones) {
        doc
          .font("Helvetica-Bold")
          .text(valorSeguro(comision.NOMBRE_COMISION), { align: "justify" });

        const integrantes = integrantesMap[comision.NOMBRE_COMISION] || [];

        if (integrantes.length > 0) {
          doc.font("Helvetica").text("Integrantes registrados:", {
            align: "justify",
          });

          for (const integrante of integrantes) {
            doc.text(`- ${integrante}`, { indent: 25 });
          }
        }

        doc.moveDown(0.5);
      }
    }

    if (propuestas.length > 0) {
      doc.font("Helvetica").text("Participación en propuestas:", {
        align: "justify",
      });

      doc.moveDown(0.5);

      for (const propuesta of propuestas) {
        doc
          .font("Helvetica-Bold")
          .text(`${valorSeguro(propuesta.CODIGO_AIR, "Sin código")}: `, {
            continued: true,
          });

        doc
          .font("Helvetica-Oblique")
          .text(valorSeguro(propuesta.TITULO, "Sin título"), {
            align: "justify",
          });
      }

      doc.moveDown();
    }

    if (cert.ESTADO_CERTIFICACION === "ANULADA") {
      doc
        .font("Helvetica-Bold")
        .fillColor("red")
        .text("Estado de la certificación: ANULADA", { align: "justify" });

      doc
        .font("Helvetica")
        .fillColor("black")
        .text(
          `Motivo de anulación: ${valorSeguro(
            cert.DESCRIPCION_MOTIVO_ANULADO,
            "No registrado"
          )}`,
          { align: "justify" }
        );

      doc.moveDown();
    }

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        'De conformidad con la Ley General de la Administración Pública, artículo 301 inciso 2, "Las declaraciones o informes que rindan sus representantes o servidores se reputarán como testimonio para todo efecto legal". La presente certificación se emite con base en los registros almacenados en el sistema AIR TEC.',
        { align: "justify" }
      );

    doc.moveDown(2);

    const fechaEmision = cert.FECHA_EMISION
      ? new Date(cert.FECHA_EMISION)
      : new Date();

    const fechaTexto = fechaEmision.toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.font("Helvetica").fontSize(11).text("Es conforme", { align: "right" });
    doc.moveDown(0.5);

    doc.text(`Se emite la presente certificación el ${fechaTexto}.`, {
      align: "right",
    });

    doc.moveDown(2.5);

    doc
      .font("Helvetica-Bold")
      .text("Secretaría AIR", { align: "right" });

    doc
      .font("Helvetica")
      .text(
        `Usuario emisor: ${valorSeguro(cert.USUARIO_EMISOR, "No registrado")}`,
        { align: "right" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar el certificado" });
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { generarCertificadoPDF };