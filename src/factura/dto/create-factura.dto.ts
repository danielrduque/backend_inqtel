// src/factura/dto/create-factura.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { EstadoFactura } from '../entities/factura.entity';

export class CreateFacturaDto {
  @ApiProperty({
    example: 'Servicio de Internet',
    description: 'Concepto de la factura',
  })
  concepto: string;

  @ApiProperty({ example: 54000, description: 'Valor de la factura' })
  valor: number;

  @ApiProperty({
    example: '2025-05-12',
    description: 'Fecha de emisión',
    type: String,
    format: 'date-time',
  })
  fecha: Date;

  @ApiProperty({
    example: '2025-06-12',
    description: 'Fecha límite de pago',
    type: String,
    format: 'date-time',
  })
  fechaLimite: Date;

  @ApiProperty({ example: 3, description: 'ID del cliente asociado' })
  clienteId: number;

  @ApiProperty({
    enum: EstadoFactura,
    default: EstadoFactura.PENDIENTE,
    description: 'Estado de la factura',
  })
  estado: EstadoFactura;
}
