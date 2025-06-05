import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    // Configuración del transportador para enviar correos
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    }) as Transporter;

    this.transporter.verify((error) => {
      if (error) {
        console.error('Error de conexión SMTP:', error);
      } else {
        console.log('Conectado a SMTP de Gmail correctamente');
      }
    });
  }

  async sendContactEmail(
    name: string,
    email: string,
    message: string,
    address: string,
    phone: number,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: `"${name}" <${email}>`,
      to: process.env.MAIL_USER,
      subject: 'Nuevo mensaje de contacto',
      text: message,
      html: `
      <h3>Nuevo mensaje de contacto</h3>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Dirección:</strong> ${address}</p>
      <p><strong>Mensaje:</strong><br/>${message}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado correctamente');
    } catch (error) {
      console.error('Error al enviar correo:', error);
    }
  }

  // Nueva función para enviar el PDF de la factura
  async sendInvoiceEmail(
    toEmail: string,
    subject: string,
    text: string,
    pdfFileName: string,
  ): Promise<void> {
    const pdfPath = join(__dirname, '../../public/facturas', pdfFileName);

    // Verificamos que el archivo exista antes de enviarlo
    if (!fs.existsSync(pdfPath)) {
      throw new Error('Archivo PDF no encontrado: ' + pdfPath);
    }

    const mailOptions: Mail.Options = {
      from: process.env.MAIL_USER,
      to: toEmail,
      subject,
      text,
      attachments: [
        {
          filename: pdfFileName,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Correo con factura enviado correctamente a', toEmail);
    } catch (error) {
      console.error('Error al enviar correo con factura:', error);
      throw error;
    }
  }
}
