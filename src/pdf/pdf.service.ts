import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
// No necesitamos 'fs' ni 'path', los eliminamos.
import { Plan } from '../plan/entities/plan.entity';

export interface ClienteParaPDF {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  direccion: string;
  plan?: Plan;
}

@Injectable()
export class PdfService {
  /**
   * Genera una factura en formato PDF y la devuelve como un Buffer en memoria.
   * No crea ningún archivo en el disco.
   */
  async generarFacturaPDF(data: {
    cliente: ClienteParaPDF;
    planNombre: string;
    monto: number;
    fecha: string;
    fechaLimite: string;
    estadoFactura: string;
    facturaId: number;
    concepto?: string;
  }): Promise<Buffer> {
    // <-- CAMBIO: Ahora devuelve una Promise<Buffer>

    // Envolvemos toda la lógica en una Promesa para capturar el resultado
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      // Escuchamos los eventos del stream para construir el PDF en memoria
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData); // La promesa se resuelve con los datos del PDF
      });
      doc.on('error', reject); // Manejo de errores

      //
      // --- TU CÓDIGO DE DIBUJO DEL PDF VA AQUÍ (SIN CAMBIOS) ---
      // Toda la lógica que tenías para diseñar la factura se mantiene igual.
      //
      const primaryColor = '#003366';
      const textColor = '#333333';
      const lightTextColor = '#555555';
      const borderColor = '#DDDDDD';
      const tableHeaderColor = '#003366';
      const whiteColor = '#FFFFFF';
      const sectionTitleBackgroundColor = '#003366';
      const sectionTitleColor = '#FFFFFF';

      const titleFontSize = 12;
      const headerFontSize = 10;
      const normalFontSize = 9;
      const smallFontSize = 8;

      const pageMargin = 40;
      const contentWidth = doc.page.width - pageMargin * 2;
      let currentY = pageMargin;

      // -------- ENCABEZADO EMPRESA Y FACTURA --------

      doc
        .font('Helvetica-Bold')
        .fillColor(primaryColor)
        .fontSize(titleFontSize + 1)
        .text(
          'IN QUALITY TELECOMUNICATIONS S.A.S.',
          pageMargin + 5,
          currentY + 5,
        )
        .font('Helvetica')
        .fontSize(normalFontSize)
        .fillColor(textColor)
        .text(
          'NIT 901323159 - Régimen Simplificado',
          pageMargin + 5,
          currentY + 23,
        )
        .text('No somos Agente Retenedor de IVA', pageMargin + 5, currentY + 36)
        .text(
          'No somos Autorretenedores de Renta',
          pageMargin + 5,
          currentY + 49,
        );

      const invoiceDetailsX = doc.page.width - pageMargin - 220;
      doc
        .font('Helvetica-Bold')
        .fontSize(titleFontSize)
        .fillColor(primaryColor)
        .text('FACTURA DE VENTA', invoiceDetailsX, currentY, {
          width: 220,
          align: 'right',
        })
        .font('Helvetica')
        .fontSize(normalFontSize)
        .fillColor(textColor)
        .text(`No. ${data.facturaId}`, invoiceDetailsX, currentY + 18, {
          width: 220,
          align: 'right',
        })
        .text(
          `Fecha de Emisión: ${data.fecha}`,
          invoiceDetailsX,
          currentY + 31,
          {
            width: 220,
            align: 'right',
          },
        )
        .text(
          `Fecha de Vencimiento: ${data.fechaLimite}`,
          invoiceDetailsX,
          currentY + 44,
          { width: 220, align: 'right' },
        );

      const estadoFacturaFormatted = data.estadoFactura.toUpperCase();
      let estadoColorPDF = textColor;
      if (data.estadoFactura.toLowerCase() === 'pagado')
        estadoColorPDF = '#28a745';
      else if (data.estadoFactura.toLowerCase() === 'pendiente')
        estadoColorPDF = '#dc3545';
      else if (data.estadoFactura.toLowerCase() === 'anulada')
        estadoColorPDF = '#ffc107';

      doc
        .font('Helvetica-Bold')
        .fontSize(normalFontSize)
        .fillColor(estadoColorPDF)
        .text(
          `Estado: ${estadoFacturaFormatted}`,
          invoiceDetailsX,
          currentY + 59,
          { width: 220, align: 'right' },
        );

      currentY += 85;

      // --- Función para dibujar bloques de datos (Emisor/Cliente) con título con fondo ---
      const drawInfoBlock = (
        title: string,
        details: { label: string; value: string }[],
        xPos: number,
        blockWidth: number,
        startY: number,
        titleBgColor: string,
        titleTextColor: string,
      ): number => {
        let blockCurrentY = startY;
        const titleHeight = 20;
        const detailRowHeight = 18;

        doc
          .rect(xPos, blockCurrentY, blockWidth, titleHeight)
          .fillAndStroke(titleBgColor, borderColor);
        doc
          .font('Helvetica-Bold')
          .fontSize(headerFontSize)
          .fillColor(titleTextColor)
          .text(title, xPos + 5, blockCurrentY + 5, { width: blockWidth - 10 });
        blockCurrentY += titleHeight;

        const detailsAreaStartY = blockCurrentY;

        details.forEach((detail, index) => {
          const yPos = blockCurrentY;
          // Dibujar la línea horizontal superior de la fila de detalle (excepto para la primera)
          if (index > 0) {
            doc
              .moveTo(xPos, yPos)
              .lineTo(xPos + blockWidth, yPos)
              .stroke(borderColor);
          }

          doc
            .font('Helvetica-Bold')
            .fontSize(smallFontSize)
            .fillColor(textColor)
            .text(detail.label, xPos + 5, yPos + 5, { width: 75 });
          doc
            .font('Helvetica')
            .fontSize(smallFontSize)
            .fillColor(lightTextColor)
            .text(detail.value, xPos + 85, yPos + 5, {
              width: blockWidth - 90,
            });

          blockCurrentY += detailRowHeight;
        });
        // Borde exterior del área de detalles
        doc
          .rect(
            xPos,
            detailsAreaStartY,
            blockWidth,
            blockCurrentY - detailsAreaStartY,
          )
          .stroke(borderColor);
        return blockCurrentY - startY;
      };

      // -------- DATOS DEL EMISOR Y CLIENTE (LADO A LADO) --------
      const blockSpacing = 10;
      const halfContentWidth = (contentWidth - blockSpacing) / 2;

      // ***** CAMBIO AQUÍ: Separar Teléfono y Email del Emisor *****
      const emisorDetails = [
        {
          label: 'Razón Social:',
          value: 'IN QUALITY TELECOMUNICATIONS S.A.S.',
        },
        { label: 'NIT:', value: '901323159' },
        {
          label: 'Dirección:',
          value: 'Cl. 3 #9-64 B/Pablo Sexto - Mocoa, Putumayo',
        },
        { label: 'Teléfono:', value: '311 2293427' }, // Separado
        { label: 'Email:', value: 'contacto@inqtel.com.co' }, // Separado
      ];
      const clienteDetails = [
        { label: 'Nombre:', value: data.cliente.nombre },
        {
          label: 'Documento:',
          value: `${data.cliente.tipoDocumento} ${data.cliente.numeroDocumento}`,
        },
        {
          label: 'Dirección:',
          value: data.cliente.direccion || 'No especificada',
        },
        {
          label: 'Teléfono:',
          value: data.cliente.telefono || 'No especificado',
        },
        { label: 'Email:', value: data.cliente.email || 'No especificado' },
      ];

      const emisorBlockHeight = drawInfoBlock(
        'DATOS DEL EMISOR',
        emisorDetails,
        pageMargin,
        halfContentWidth,
        currentY,
        sectionTitleBackgroundColor,
        sectionTitleColor,
      );
      const clienteBlockHeight = drawInfoBlock(
        'DATOS DEL CLIENTE',
        clienteDetails,
        pageMargin + halfContentWidth + blockSpacing,
        halfContentWidth,
        currentY,
        sectionTitleBackgroundColor,
        sectionTitleColor,
      );

      currentY += Math.max(emisorBlockHeight, clienteBlockHeight) + 15;

      // -------- TABLA DE DETALLES DE FACTURA --------
      // ... (El resto del código de la tabla de ítems, totales, instrucciones de pago, firmas y pie de página se mantiene igual que en la versión anterior) ...
      //const tableTop = currentY;
      const itemRowHeight = 25;
      const tableHeaderHeight = 25;
      const columnDefinition = [
        {
          id: 'descripcion',
          header: 'DESCRIPCIÓN',
          widthRatio: 0.5,
          align: 'left' as const,
        },
        {
          id: 'cantidad',
          header: 'CANT.',
          widthRatio: 0.1,
          align: 'right' as const,
        },
        {
          id: 'valorUnit',
          header: 'VALOR UNIT.',
          widthRatio: 0.2,
          align: 'right' as const,
        },
        {
          id: 'total',
          header: 'TOTAL',
          widthRatio: 0.2,
          align: 'right' as const,
        },
      ];

      doc
        .rect(pageMargin, currentY, contentWidth, tableHeaderHeight)
        .fill(tableHeaderColor)
        .stroke(borderColor);
      let currentX = pageMargin;
      doc.font('Helvetica-Bold').fontSize(normalFontSize).fillColor(whiteColor);
      columnDefinition.forEach((col) => {
        doc.text(col.header, currentX + 5, currentY + 7, {
          width: contentWidth * col.widthRatio - 10,
          align: col.align,
        });
        if (col.id !== 'total') {
          doc
            .moveTo(currentX + contentWidth * col.widthRatio, currentY)
            .lineTo(
              currentX + contentWidth * col.widthRatio,
              currentY + tableHeaderHeight,
            )
            .stroke(borderColor);
        }
        currentX += contentWidth * col.widthRatio;
      });
      currentY += tableHeaderHeight;

      doc
        .rect(pageMargin, currentY, contentWidth, itemRowHeight)
        .stroke(borderColor);
      currentX = pageMargin;
      doc.font('Helvetica').fontSize(normalFontSize).fillColor(textColor);
      const conceptoFactura =
        data.concepto || `Servicio de Internet Plan ${data.planNombre}`;
      const itemData = [
        conceptoFactura,
        '1',
        `$${data.monto.toLocaleString('es-CO')}`,
        `$${data.monto.toLocaleString('es-CO')}`,
      ];
      columnDefinition.forEach((col, i) => {
        doc.text(itemData[i], currentX + 5, currentY + 7, {
          width: contentWidth * col.widthRatio - 10,
          align: col.align,
        });
        if (col.id !== 'total') {
          doc
            .moveTo(currentX + contentWidth * col.widthRatio, currentY)
            .lineTo(
              currentX + contentWidth * col.widthRatio,
              currentY + itemRowHeight,
            )
            .stroke(borderColor);
        }
        currentX += contentWidth * col.widthRatio;
      });
      currentY += itemRowHeight;

      const totalsXStart =
        pageMargin +
        contentWidth *
          (columnDefinition[0].widthRatio + columnDefinition[1].widthRatio);
      const totalsLabelWidth = contentWidth * columnDefinition[2].widthRatio;
      const totalsValueWidth = contentWidth * columnDefinition[3].widthRatio;

      currentY += 5;
      doc.font('Helvetica').fontSize(normalFontSize).fillColor(textColor);
      doc.text('SUBTOTAL:', totalsXStart, currentY, {
        width: totalsLabelWidth - 10,
        align: 'right',
      });
      doc.text(
        `$${data.monto.toLocaleString('es-CO')}`,
        totalsXStart + totalsLabelWidth,
        currentY,
        { width: totalsValueWidth - 10, align: 'right' },
      );
      currentY += 18;

      doc.font('Helvetica-Bold').fontSize(headerFontSize).fillColor(textColor);
      doc.text('TOTAL A PAGAR:', totalsXStart, currentY, {
        width: totalsLabelWidth - 10,
        align: 'right',
      });
      doc.text(
        `$${data.monto.toLocaleString('es-CO')}`,
        totalsXStart + totalsLabelWidth,
        currentY,
        { width: totalsValueWidth - 10, align: 'right' },
      );
      currentY += 30;

      if (currentY > doc.page.height - 160) {
        doc.addPage();
        currentY = pageMargin;
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(normalFontSize)
        .fillColor(primaryColor)
        .text('Instrucciones de Pago:', pageMargin, currentY);
      currentY += 15;
      doc
        .font('Helvetica')
        .fontSize(smallFontSize)
        .fillColor(textColor)
        .text(
          'Pagos en: Calle 3 #9-64 Pablo VI Mocoa',
          pageMargin + 5,
          currentY,
        )
        .text(
          'Cuenta Bancolombia Ahorros No. 92700000253',
          pageMargin + 5,
          currentY + 13,
        );
      currentY += 35;

      doc
        .font('Helvetica-Oblique')
        .fontSize(smallFontSize)
        .text(
          'Esta factura se asimila en todos sus efectos a una letra de cambio, de conformidad con el Art. 774 del Código de Comercio.',
          pageMargin,
          currentY,
          { align: 'justify', width: contentWidth },
        );
      currentY += 30;

      const firmasYPosition = Math.max(currentY, doc.page.height - 100);
      doc.lineWidth(0.5);
      doc
        .moveTo(pageMargin + 30, firmasYPosition + 20)
        .lineTo(pageMargin + 30 + 200, firmasYPosition + 20)
        .strokeColor(textColor)
        .stroke();
      doc
        .fontSize(smallFontSize)
        .fillColor(textColor)
        .text('FIRMA EMISOR', pageMargin + 30, firmasYPosition + 25, {
          width: 200,
          align: 'center',
        });

      doc
        .moveTo(doc.page.width - pageMargin - 30 - 200, firmasYPosition + 20)
        .lineTo(doc.page.width - pageMargin - 30, firmasYPosition + 20)
        .strokeColor(textColor)
        .stroke();
      doc.text(
        'FIRMA CLIENTE (ACEPTADA)',
        doc.page.width - pageMargin - 30 - 200,
        firmasYPosition + 25,
        { width: 200, align: 'center' },
      );

      const pageBottom = doc.page.height - 30;
      doc
        .fontSize(smallFontSize - 1)
        .fillColor(borderColor)
        .text(
          `Factura generada por INGTEL S.A.S. - Software de Facturación Interno.`,
          pageMargin,
          pageBottom,
          { align: 'center', width: contentWidth },
        );

      doc.end();
    });
  }
}
