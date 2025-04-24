import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Factura } from '../factura/entities/factura.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { UserModule } from '../user/user.module';
import { FacturaModule } from '../factura/factura.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Factura]),
    forwardRef(() => UserModule), // Usamos forwardRef para dependencias circulares
    forwardRef(() => FacturaModule), // Si FacturaModule también necesita PagoModule
  ],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService], // Exportamos el servicio si será usado en otros módulos
})
export class PagoModule {}