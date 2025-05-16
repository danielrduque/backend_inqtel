import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class PdfService {
  async generarFacturaPDF(data: {
    cliente: string;
    documento: string;
    plan: string;
    monto: number;
    fecha: string;
    estado: string;
    facturaId: number;
  }): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const fileName = `factura_${data.facturaId}.pdf`;
    const filePath = join(__dirname, '../../public/facturas', fileName);

    fs.mkdirSync(join(__dirname, '../../public/facturas'), { recursive: true });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // -------- ENCABEZADO ESTÁTICO --------
    doc
      .image(join(__dirname, '../../public/logo.png'), 50, 20, { width: 60 })
      .fillColor('black')
      .fontSize(12)
      .text('IN QUALITY TELECOMUNICATIONS S.A.S.', 120, 25)
      .fontSize(9)
      .text('NIT 901323159 - Régimen Simplificado', 120, 40)
      .text('No somos Agente Retenedor de IVA', 120, 55)
      .text('No somos Autorretenedores de Renta', 120, 70);

    // Marco de facturación
    doc.rect(40, 90, 515, 60).strokeColor('#e2e8f0').lineWidth(0.5).stroke();

    // Detalles de numeración
    doc
      .fontSize(8)
      .fillColor('black')
      .text('Factura Electrónica de Venta No. 1874/07833085', 50, 100)
      .text('Válida: 17/05/2024 - 17/05/2025', 50, 115)
      .text('Autorización INQNA:26734', 50, 130);

    // -------- DATOS PRINCIPALES --------
    const estadoX = 300;
    const estadoY = 115;
    const estadoColor =
      data.estado.toLowerCase() === 'pendiente' ? '#ff0000' : '#66FF33 '; // rojo o verde

    // Fecha (texto negro)
    doc.fontSize(9).fillColor('black').text(`Fecha: ${data.fecha}`, estadoX, 100);

    // Fondo coloreado para "Estado" que va hasta la línea del marco (x=555)
    const estadoWidth = 555 - estadoX; // ancho desde x=300 hasta x=555
    const estadoHeight = 14;

    doc
      .save()
      .rect(estadoX, estadoY - 3, estadoWidth, estadoHeight)
      .fill(estadoColor)
      .restore();

    // Texto "Estado" encima del fondo en negro
    doc.fillColor('black').fontSize(9).text(`Estado: ${data.estado}`, estadoX, estadoY);

    // Forma de Pago (texto negro)
    doc.text('Forma de Pago: Contado', estadoX, 130);

    // Sección Emisor/Cliente
    const yStart = 150;
    doc.rect(40, yStart, 515, 80).stroke();

    // Emisor (datos estáticos)
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DATOS DEL EMISOR:', 50, yStart + 10)
      .font('Helvetica')
      .text('IN QUALITY TELECOMUNICATIONS S.A.S.', 50, yStart + 25)
      .text('NIT 901323159', 50, yStart + 40)
      .text('Cl. 3 #9-64 B/Pablo Sexto - Mocoa, Putumayo', 50, yStart + 55)
      .text('Contacto: 311 2293427 | contacto@inqtel.com.co', 50, yStart + 70);

    // Cliente (datos dinámicos)
    doc
      .font('Helvetica-Bold')
      .text('DATOS DEL CLIENTE:', 300, yStart + 10)
      .font('Helvetica')
      .text(data.cliente, 300, yStart + 25)
      .text(`Documento: ${data.documento}`, 300, yStart + 40)
      .text('Dirección: Mocoa, Putumayo', 300, yStart + 55);

    // -------- TABLA DETALLADA --------
    const tableTop = yStart + 100;
    const columns = [
      { label: 'No', x: 50, width: 30 },
      { label: 'DESCRIPCIÓN', x: 80, width: 250 },
      { label: 'CANT', x: 330, width: 50 },
      { label: 'PRECIO', x: 380, width: 80 },
      { label: 'TOTAL', x: 460, width: 80 },
    ];

    // Encabezado tabla
    doc.font('Helvetica-Bold').fontSize(9);
    columns.forEach((col) => doc.text(col.label, col.x, tableTop));

    // Línea divisoria
    doc
      .moveTo(40, tableTop + 15)
      .lineTo(555, tableTop + 15)
      .stroke();

    // Contenido tabla
    doc
      .font('Helvetica')
      .fontSize(9)
      .text('1', 50, tableTop + 25)
      .text(`PLAN ${data.plan}`, 80, tableTop + 25)
      .text('1', 330, tableTop + 25)
      .text(`$${data.monto.toLocaleString('es-CO')}`, 380, tableTop + 25)
      .text(`$${data.monto.toLocaleString('es-CO')}`, 460, tableTop + 25);

    // Totales
    doc
      .moveTo(40, tableTop + 55)
      .lineTo(555, tableTop + 55)
      .stroke()
      .font('Helvetica-Bold')
      .text('TOTAL A PAGAR:', 380, tableTop + 65)
      .text(`$${data.monto.toLocaleString('es-CO')}`, 460, tableTop + 65);

    // -------- INSTRUCCIONES PAGO Y FIRMAS --------
    const detallesFinalesY = 650;
    doc
      .fontSize(8)
      .text('Pagos en: Calle 3 #9-64 Pablo VI Mocoa', 50, detallesFinalesY)
      .text('Cuenta Bancolombia No. 92700000253', 50, detallesFinalesY + 15);

    // Líneas de firmas
    const firmasY = detallesFinalesY - 180;
    doc
      .moveTo(50, firmasY)
      .lineTo(250, firmasY)
      .stroke()
      .moveTo(300, firmasY)
      .lineTo(500, firmasY)
      .stroke();

    doc
      .fontSize(8)
      .text('FIRMA EMISOR', 50, firmasY + 5)
      .text('FIRMA CLIENTE', 300, firmasY + 5);

    // -------- PIE LEGAL COMPLETO --------
    const pieY = 750;
    doc
      .text(
        'Software de Facturas hecho Por Daniel Duque 1006948671',
        50,
        pieY + 15,
        {
          align: 'center',
        },
      )
      .text('PÁGINA 1/1', 500, pieY + 30, { align: 'right' });

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(fileName));
      writeStream.on('error', (err) => reject(err));
    });
  }
}
