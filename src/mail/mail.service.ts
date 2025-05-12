import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

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
        user: 'contacinqtel@gmail.com',
        pass: 'tmguhtqcjmtybmfl', // Asegúrate de que esta contraseña sea correcta
      },
    }) as Transporter;
  }

  async sendContactEmail(
    name: string,
    email: string,
    message: string,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: `"${name}" <${email}>`,
      to: 'contacinqtel@gmail.com',
      subject: 'Nuevo mensaje de contacto',
      text: message,
      html: `
        <h3>Nuevo mensaje de contacto</h3>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br/>${message}</p>
      `,
    };

    try {
      // Intentar enviar el correo
      await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado correctamente');
    } catch (error) {
      // Manejo de errores
      console.error('Error al enviar correo:', error);
    }
  }
}
