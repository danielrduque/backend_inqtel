export class CreatePagoDto {
  facturaId: number;
  monto: number;
  fechaPago: Date; // <-- este faltaba
}
