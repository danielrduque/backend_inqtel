import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Factura } from '../factura/entities/factura.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { UserModule } from '../user/user.module'; // Importa el UserModule para acceder al ClientRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, Factura]), // Asegúrate de que Pago y Factura estén aquí
    UserModule, // Importa el UserModule para usar el ClientRepository
  ],
  controllers: [PagoController],
  providers: [PagoService],
})
export class PagoModule {}
