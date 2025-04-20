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
    const factura = await this.facturaService.findByClienteId(clienteId);
    if (factura.length > 0) {
      return factura[0];
    } else {
      return { encontrado: false };
    }
  }

  // Nuevo endpoint para buscar por número de documento
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
