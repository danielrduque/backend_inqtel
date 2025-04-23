// src/pago/pago.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Controller('pagos')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post()
  async crearPago(@Body() createPagoDto: CreatePagoDto) {
    console.log('Solicitud de pago recibida:', createPagoDto); // Agregar log
    return this.pagoService.crearPago(createPagoDto);
  }
}
