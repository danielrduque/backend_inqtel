// src/factura/dto/create-factura.dto.ts
export class CreateFacturaDto {
  cedula: string;
  nombre: string;
  concepto: string;
  valor: number;
  fecha: Date;
}
