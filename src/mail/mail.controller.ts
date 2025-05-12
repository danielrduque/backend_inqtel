// src/mail/mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('contacto')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async enviarCorreo(
    @Body() body: { name: string; email: string; message: string },
  ) {
    await this.mailService.sendContactEmail(
      body.name,
      body.email,
      body.message,
    );
    return { message: 'Correo enviado con éxito' };
  }
}
