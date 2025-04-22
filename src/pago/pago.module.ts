import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Factura } from '../factura/entities/factura.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Factura])],
  controllers: [PagoController],
  providers: [PagoService],
})
export class PagoModule {}
