// src/pago/pago.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Get } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('pagos')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async crearPago(@Body() createPagoDto: CreatePagoDto) {
    console.log('Solicitud de pago recibida:', createPagoDto); // Agregar log
    return this.pagoService.crearPago(createPagoDto);
  }

  @Get('ingresos-mensuales')
  getIngresosMensuales(): Promise<number> {
    return this.pagoService.getIngresosMensuales();
  }
}
