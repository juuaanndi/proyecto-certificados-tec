const PDFDocument = require('pdfkit');
const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function generarCertificadoPDF(req, res) {
  const { id } = req.params;
  let connection;

  try {
    connection = await getConnection();

    // Datos principales del asambleísta y nombramiento
    const certResult = await connection.execute(
      `SELECT C.NUMERO_DOCUMENTO, C.FECHA_EMISION,
              A.NOMBRE AS NOMBRE_ASAMBLEISTA, A.CEDULA,
              N.ID_NOMBRAMIENTO, N.PUESTO, N.CONDICION, N.INICIO, N.ESTADO,
              S.NOMBRE AS NOMBRE_SECTOR,
              P.NOMBRE AS NOMBRE_PERIODO
       FROM CERTIFICACION C
       JOIN NOMBRAMIENTO N ON C.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
       JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
       JOIN SECTOR S ON N.ID_SECTOR = S.ID_SECTOR
       JOIN PERIODO_AIR P ON N.ID_PERIODO = P.ID_PERIODO
       WHERE C.ID_CERTIFICACION = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!certResult.rows.length) {
      return res.status(404).json({ error: 'Certificación no encontrada' });
    }

    const cert = certResult.rows[0];
    const idNombramiento = cert.ID_NOMBRAMIENTO;

    // Contar sesiones asistidas
    const sesionesResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL_SESIONES,
              SUM(CASE WHEN ASISTIO = 'S' THEN 1 ELSE 0 END) AS SESIONES_ASISTIDAS
       FROM ASISTENCIA WHERE ID_NOMBRAMIENTO = :id`,
      [idNombramiento],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const sesiones = sesionesResult.rows[0];

    // Comisiones en las que participó
    const comisionesResult = await connection.execute(
      `SELECT CT.NOMBRE AS NOMBRE_COMISION, IC.INICIO, IC.FIN
       FROM INTEGRANTE_COMISION IC
       JOIN COMISION_TRABAJO CT ON IC.ID_COMISION = CT.ID_COMISION
       WHERE IC.ID_NOMBRAMIENTO = :id`,
      [idNombramiento],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Propuestas en las que participó
    const propuestasResult = await connection.execute(
      `SELECT P.TITULO, P.CODIGO_AIR, P.TIPO
       FROM PROPOSITOR PR
       JOIN PROPUESTA P ON PR.ID_PROPUESTA = P.ID_PROPUESTA
       WHERE PR.ID_NOMBRAMIENTO = :id`,
      [idNombramiento],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Integrantes de cada comisión
    const integrantesMap = {};
    for (const comision of comisionesResult.rows) {
      const intResult = await connection.execute(
        `SELECT A.NOMBRE
         FROM INTEGRANTE_COMISION IC
         JOIN NOMBRAMIENTO N ON IC.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
         JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
         JOIN COMISION_TRABAJO CT ON IC.ID_COMISION = CT.ID_COMISION
         WHERE CT.NOMBRE = :nombre`,
        [comision.NOMBRE_COMISION],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      integrantesMap[comision.NOMBRE_COMISION] = intResult.rows.map(r => r.NOMBRE);
    }

    // Generar PDF
    const doc = new PDFDocument({ margin: 70, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${cert.NUMERO_DOCUMENTO}.pdf`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(11).font('Helvetica-Bold')
      .text('DIRECTORIO DE LA ASAMBLEA INSTITUCIONAL REPRESENTATIVA', { align: 'center' });
    doc.text('CONSTANCIA', { align: 'center' });
    doc.text(cert.NUMERO_DOCUMENTO, { align: 'center' });
    doc.moveDown();

    // Introducción
    doc.font('Helvetica').fontSize(11)
      .text('El presidente del Directorio de la Asamblea Institucional Representativa, hace constar que:', { align: 'justify' });
    doc.moveDown();

    // Nombre y cédula
    doc.font('Helvetica-Bold').fontSize(12)
      .text(cert.NOMBRE_ASAMBLEISTA, { align: 'center' });
    doc.text(`Cédula de identidad Nº ${cert.CEDULA}`, { align: 'center' });
    doc.moveDown();

    // Representación
    doc.font('Helvetica').fontSize(11)
      .text('De acuerdo con los registros de la Secretaría de la AIR asume la siguiente representación ante la Asamblea Institucional Representativa:', { align: 'justify' });
    doc.moveDown(0.5);

    const vigente = cert.ESTADO === 'ACTIVO' ? 'y su nombramiento se encuentra vigente.' : `hasta el ${new Date(cert.FIN).toLocaleDateString('es-CR')}.`;
    const anioInicio = new Date(cert.INICIO).getFullYear();
    doc.font('Helvetica-Oblique').text(
      `✔ ${cert.NOMBRE_SECTOR}, ${cert.PUESTO}, a partir del año ${anioInicio} ${vigente}`,
      { indent: 20, align: 'justify' }
    );
    doc.moveDown();

    // Asistencia
    doc.font('Helvetica').text(
      `Según consta en nuestros registros de asistencia se reporta su participación en las ${sesiones.SESIONES_ASISTIDAS} sesiones convocadas para este período.`,
      { align: 'justify' }
    );
    doc.moveDown();

    // Comisiones
    if (comisionesResult.rows.length > 0) {
      doc.text('También, participó activamente en el trabajo de las siguientes comisiones:', { align: 'justify' });
      doc.moveDown(0.5);

      for (const comision of comisionesResult.rows) {
        doc.font('Helvetica-Bold').text(comision.NOMBRE_COMISION, { align: 'justify' });
        doc.moveDown(0.3);
        doc.font('Helvetica').text('La comisión de trabajo fue integrada por las siguientes personas:', { align: 'justify' });
        doc.moveDown(0.3);

        const integrantes = integrantesMap[comision.NOMBRE_COMISION] || [];
        const mitad = Math.ceil(integrantes.length / 2);
        for (let i = 0; i < mitad; i++) {
          const izq = integrantes[i] || '';
          const der = integrantes[i + mitad] || '';
          doc.text(`${izq.padEnd(35)} ${der}`, { indent: 30 });
        }
        doc.moveDown();
      }
    }

    // Propuestas
    if (propuestasResult.rows.length > 0) {
      doc.text('Participó en el trabajo de las siguientes propuestas:', { align: 'justify' });
      doc.moveDown(0.5);
      for (const propuesta of propuestasResult.rows) {
        doc.font('Helvetica-Bold').text(`${propuesta.CODIGO_AIR}: `, { continued: true });
        doc.font('Helvetica-Oblique').text(propuesta.TITULO, { align: 'justify' });
        doc.moveDown(0.3);
      }
      doc.moveDown();
    }

    // Declaración jurada
    doc.font('Helvetica').fontSize(10)
      .text('De conformidad con la Ley General de la Administración Pública, artículo 301 inciso 2, "Las declaraciones o informes que rindan sus representantes o servidores se reputarán como testimonio para todo efecto legal". En consecuencia, esta certificación se realiza en condición de declaración jurada consciente de las penas con que la legislación costarricense sanciona el delito de falso testimonio.',
        { align: 'justify' });
    doc.moveDown(2);

    // Fecha y firma
    const fecha = new Date(cert.FECHA_EMISION);
    const diasTexto = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
      'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
      'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y uno'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    doc.font('Helvetica').fontSize(11)
      .text('Es conforme', { align: 'right' });
    doc.moveDown(0.5);
    doc.text(`Se extiende la presente a solicitud de la interesada a los ${diasTexto[fecha.getDate()]} días del mes de ${meses[fecha.getMonth()]} del ${fecha.getFullYear() === 2025 ? 'dos mil veinticinco' : fecha.getFullYear()}.`,
      { align: 'right' });
    doc.moveDown(3);
    doc.font('Helvetica-Bold').text('Presidente del Directorio', { align: 'right' });
    doc.font('Helvetica').text('Asamblea Institucional Representativa', { align: 'right' });

    doc.end();

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error al generar el certificado' });
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { generarCertificadoPDF };