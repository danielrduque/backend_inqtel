// src/factura/dto/create-factura.dto.ts
export class CreateFacturaDto {
  concepto: string;
  valor: number;
  fecha: Date;
  fechaLimite: Date;
  clienteId: number; // En vez de cedula y nombre, usaremos clienteId para la relación con el cliente
}
