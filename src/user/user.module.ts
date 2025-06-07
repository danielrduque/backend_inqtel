import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Plan } from '../plan/entities/plan.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FacturaModule } from '../factura/factura.module';
import { PagoModule } from '../pago/pago.module';
import { Factura } from '../factura/entities/factura.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Plan, Factura]),
    forwardRef(() => FacturaModule),
    forwardRef(() => PagoModule), // Si existe dependencia circular
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [
    UserService,
    TypeOrmModule.forFeature([Client]), // Exportamos el repositorio
  ],
})
export class UserModule {}
