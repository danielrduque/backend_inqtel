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

  @Get('buscar/:clienteId')
  async findByClienteId(
    @Param('clienteId') clienteId: number,
  ): Promise<Factura | { encontrado: boolean }> {
    // Llamar al método findByClienteId en lugar de findByCedula
    const factura = await this.facturaService.findByClienteId(clienteId);
    if (factura.length > 0) {
      return factura[0]; // Devuelve la primera factura encontrada
    } else {
      return { encontrado: false }; // Devuelve 'false' si no encuentra la factura
    }
  }
}
