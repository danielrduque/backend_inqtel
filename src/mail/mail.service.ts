import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
//import { join } from 'path';
//import * as fs from 'fs';

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
    pdfBuffer: Buffer, // <-- Parámetro 4: El Buffer del PDF
    pdfFileName: string, // <-- Parámetro 5: El nombre del archivo
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"INQTEL S.A.S." <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject,
      text,
      html: `<p>Estimado/a cliente,</p><p>Gracias por su pago. Adjuntamos su factura en este correo.</p><p>Atentamente,<br/>El equipo de INGTEL S.A.S.</p>`,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(
        'Correo con factura adjunta enviado correctamente a',
        toEmail,
      );
    } catch (error) {
      console.error('Error al enviar correo con adjunto:', error);
      throw error;
    }
  }
}
