// src/factura/factura.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { UserModule } from '../user/user.module'; // Importamos el UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura]), // Registramos la entidad Factura
    UserModule, // Importamos UserModule para acceder a ClientService
  ],
  controllers: [FacturaController],
  providers: [FacturaService],
})
export class FacturaModule {}
