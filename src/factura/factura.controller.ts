import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { Factura } from './entities/factura.entity'; // Importa EstadoFactura
import { PdfService, ClienteParaPDF } from '../pdf/pdf.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
//import { join } from 'path';

@Controller('facturas')
export class FacturaController {
  constructor(
    private readonly facturaService: FacturaService,
    private readonly pdfService: PdfService, // inyectar PdfService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateFacturaDto): Promise<Factura> {
    return this.facturaService.create(dto);
  }

  @Get('buscar/:clienteId')
  async findByClienteId(
    @Param('clienteId', ParseIntPipe) clienteId: number, // Usar ParseIntPipe para convertir y validar
  ): Promise<Factura | { encontrado: false }> {
    // ParseIntPipe ya maneja la conversión y lanza un BadRequestException si no es un número.
    const factura = await this.facturaService.findByClienteId(clienteId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!factura || (factura as any).encontrado === false) {
      // Comprobar si es el objeto {encontrado: false}
      // El servicio ya devuelve { encontrado: false }, así que podemos devolverlo directamente.
      // O si prefieres lanzar NotFoundException aquí:
      // throw new NotFoundException(`No se encontró factura pendiente para el cliente ID: ${clienteId}`);
      return { encontrado: false }; // Aseguramos que se devuelve el tipo esperado
    }
    return factura as Factura; // Aseguramos que se devuelve el tipo esperado
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
  async descargarFactura(@Param('id') id: string, @Res() res: Response) {
    const facturaIdNumber = Number(id);
    if (isNaN(facturaIdNumber)) {
      // Considera usar BadRequestException de @nestjs/common
      return res
        .status(400)
        .json({ mensaje: 'El ID de la factura debe ser un número.' });
    }

    const factura = await this.facturaService.findById(facturaIdNumber);
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    if (!factura.cliente) {
      throw new NotFoundException(
        'Cliente asociado a la factura no encontrado.',
      );
    }
    if (!factura.cliente.plan) {
      throw new NotFoundException(
        'Plan del cliente no encontrado para la factura.',
      );
    }

    const clienteData: ClienteParaPDF = {
      nombre: factura.cliente.nombre,
      tipoDocumento: factura.cliente.tipoDocumento,
      numeroDocumento: factura.cliente.numeroDocumento,
      email: factura.cliente.email,
      telefono: factura.cliente.telefono,
      direccion: factura.cliente.direccion,
      // El plan se puede omitir aquí si se pasa planNombre por separado
      // plan: factura.cliente.plan
    };

    const pdfData = {
      cliente: clienteData, // Correcto: ahora es un objeto ClienteParaPDF
      planNombre: factura.cliente.plan.nombre, // Añadido
      monto: factura.valor,
      fecha: new Date(factura.fecha).toISOString().slice(0, 10),
      fechaLimite: factura.fechaLimite
        ? new Date(factura.fechaLimite).toISOString().slice(0, 10)
        : 'N/A', // Añadido
      estadoFactura: factura.estado as string, // Añadido (cast a string si el enum es compatible)
      facturaId: factura.id,
      concepto: factura.concepto,
    };

    try {
      // generarFacturaPDF ahora devuelve la ruta completa del archivo
      const filePath = await this.pdfService.generarFacturaPDF(pdfData);
      res.sendFile(filePath); // Envía el archivo usando la ruta completa
    } catch (error) {
      console.error('Error al generar o enviar el PDF:', error);
      res
        .status(500)
        .json({ mensaje: 'Error al generar el PDF de la factura.' });
    }
  }
}
