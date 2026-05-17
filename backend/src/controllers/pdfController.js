const PDFDocument = require('pdfkit');
const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function generarCertificadoPDF(req, res) {
  const { id } = req.params;
  let connection;

  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT C.ID_CERTIFICACION, C.NUMERO_DOCUMENTO, C.FECHA_EMISION, C.ESTADO,
              A.NOMBRE AS NOMBRE_ASAMBLEISTA, A.CEDULA,
              N.FECHA_INICIO, N.FECHA_FIN, N.CARGO
       FROM CERTIFICACION C
       JOIN NOMBRAMIENTO N ON C.ID_NOMBRAMIENTO = N.ID_NOMBRAMIENTO
       JOIN ASAMBLEISTA A ON N.ID_ASAMBLEISTA = A.ID_ASAMBLEISTA
       WHERE C.ID_CERTIFICACION = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Certificación no encontrada' });
    }

    const cert = result.rows[0];

    const doc = new PDFDocument({ margin: 60 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificado_${cert.NUMERO_DOCUMENTO}.pdf`);

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('Instituto Tecnológico de Costa Rica', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Asamblea Institucional Representativa', { align: 'center' });
    doc.moveDown(2);

    // Título
    doc.fontSize(18).font('Helvetica-Bold').text('CERTIFICACIÓN', { align: 'center' });
    doc.moveDown();

    // Número de documento
    doc.fontSize(12).font('Helvetica').text(`Número: ${cert.NUMERO_DOCUMENTO}`, { align: 'center' });
    doc.moveDown(2);

    // Cuerpo
    doc.fontSize(12).font('Helvetica').text(
      `Se certifica que ${cert.NOMBRE_ASAMBLEISTA}, portador(a) de la cédula de identidad número ${cert.CEDULA}, ` +
      `ha ejercido el cargo de ${cert.CARGO} en la Asamblea Institucional Representativa del Tecnológico de Costa Rica, ` +
      `desde el ${new Date(cert.FECHA_INICIO).toLocaleDateString('es-CR')} hasta el ${new Date(cert.FECHA_FIN).toLocaleDateString('es-CR')}.`,
      { align: 'justify', lineGap: 6 }
    );
    doc.moveDown(2);

    // Fecha de emisión
    doc.fontSize(11).text(`Fecha de emisión: ${new Date(cert.FECHA_EMISION).toLocaleDateString('es-CR')}`, { align: 'right' });
    doc.moveDown(3);

    // Firma
    doc.fontSize(12).text('_______________________________', { align: 'center' });
    doc.text('Secretaría AIR - TEC', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error al generar el certificado' });
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { generarCertificadoPDF };