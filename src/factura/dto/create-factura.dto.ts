// src/factura/dto/create-factura.dto.ts
import { EstadoFactura } from '../entities/factura.entity'; // Importa el enum

export class CreateFacturaDto {
  concepto: string;
  valor: number;
  fecha: Date;
  fechaLimite: Date;
  clienteId: number; // Relación con el cliente

  // Añadimos el estado con un valor por defecto en el DTO
  estado: EstadoFactura = EstadoFactura.PENDIENTE; // Valor por defecto
}
