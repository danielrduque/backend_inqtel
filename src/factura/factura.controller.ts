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
  ): Promise<Factura | { encontrado: false }> {
    return this.facturaService.findByClienteId(clienteId);
  }

  // Endpoint para buscar la última factura pendiente por número de documento
  @Get('consulta/:numeroDocumento')
  async findByNumeroDocumento(
    @Param('numeroDocumento') numeroDocumento: string,
  ): Promise<
    | {
        nombre: string;
        plan: string;
        precio: number;
        fechaLimite: Date;
      }
    | { encontrado: false }
  > {
    return this.facturaService.findByNumeroDocumento(numeroDocumento);
  }
}
