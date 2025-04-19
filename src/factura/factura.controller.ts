// src/factura/factura.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Factura } from './entities/factura.entity';

@Controller('facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Post()
  create(@Body() dto: CreateFacturaDto): Promise<Factura> {
    return this.facturaService.create(dto);
  }

  @Get(':cedula')
  findByCedula(@Param('cedula') cedula: string): Promise<Factura[]> {
    return this.facturaService.findByCedula(cedula);
  }
}
