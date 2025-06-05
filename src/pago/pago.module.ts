import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Factura } from '../factura/entities/factura.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { UserModule } from '../user/user.module';
import { FacturaModule } from '../factura/factura.module';
import { PdfService } from '../pdf/pdf.service';
import { MailModule } from '../mail/mail.module'; // Importa el módulo del servicio de correo

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Factura]),
    forwardRef(() => UserModule), // Usamos forwardRef para dependencias circulares
    forwardRef(() => FacturaModule), // Si FacturaModule también necesita PagoModule
    forwardRef(() => MailModule), // Importa MailModule para poder usar MailService
  ],
  controllers: [PagoController],
  providers: [PagoService, PdfService],
  exports: [PagoService], // Exportamos el servicio si será usado en otros módulos
})
export class PagoModule {}
