import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString } from 'class-validator';

export class CreatePagoDto {
  @ApiProperty({ description: 'ID de la factura asociada', example: 1 })
  @IsNumber()
  facturaId: number;

  @ApiProperty({ description: 'Monto del pago', example: 54000 })
  @IsNumber()
  monto: number;

  @ApiProperty({
    description: 'Fecha en que se realizó el pago',
    example: '2025-05-15T14:30:00Z',
  })
  @IsDateString()
  fechaPago: Date;
}
