import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Factura } from './entities/factura.entity';
import { PdfService } from '../pdf/pdf.service';
import { Response } from 'express';
import { join } from 'path';

@Controller('facturas')
export class FacturaController {
  constructor(
    private readonly facturaService: FacturaService,
    private readonly pdfService: PdfService, // inyectar PdfService
  ) {}

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

  // Agregar este endpoint
  @Get()
  findAll(): Promise<Factura[]> {
    return this.facturaService.findAll();
  }

  @Get('historial/:clienteId')
  findAllByCliente(@Param('clienteId') clienteId: number): Promise<Factura[]> {
    return this.facturaService.findAllByClienteId(clienteId);
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

  @Get('pdf/:id')
  async descargarFactura(@Param('id') id: number, @Res() res: Response) {
    // Buscar datos de la factura para el PDF
    const factura = await this.facturaService.findById(id);
    if (!factura) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    // Construir el objeto para el servicio PDF
    const pdfData = {
      cliente: factura.cliente.nombre,
      documento: factura.cliente.numeroDocumento,
      plan: factura.cliente.plan.nombre, // Corregido aquí
      monto: factura.valor, // Corregido aquí (antes 'monto')
      fecha: new Date(factura.fecha).toISOString().slice(0, 10), // formato yyyy-mm-dd
      estado: factura.estado,
      facturaId: factura.id,
    };

    // Generar el PDF y obtener el nombre del archivo
    const fileName = await this.pdfService.generarFacturaPDF(pdfData);
    const filePath = join(__dirname, '../../public/facturas', fileName);

    // Enviar archivo PDF como descarga
    res.sendFile(filePath);
  }
}
