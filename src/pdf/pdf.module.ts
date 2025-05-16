// pdf.module.ts
import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Module({
  providers: [PdfService],
  exports: [PdfService], // <-- exporta el servicio para que otros módulos puedan usarlo
})
export class PdfModule {}
