// src/factura/factura.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { UserModule } from '../user/user.module';
import { PdfModule } from '../pdf/pdf.module'; // <-- Importa PdfModule
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura]),
    forwardRef(() => UserModule), // Para resolver la circularidad
    PdfModule, // <-- Añadido PdfModule
    AuthModule,
  ],
  controllers: [FacturaController],
  providers: [FacturaService],
  exports: [FacturaService], // Muy importante exportar para otros módulos
})
export class FacturaModule {}
