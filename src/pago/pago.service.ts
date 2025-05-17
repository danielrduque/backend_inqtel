// src/pago/pago.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { Factura, EstadoFactura } from '../factura/entities/factura.entity';
import { Client } from '../user/entities/client.entity';
import { PdfService } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service'; // Importa tu MailService personalizado

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Client)
    private readonly clienteRepository: Repository<Client>,

    private readonly pdfService: PdfService,

    private readonly mailService: MailService, // Inyectamos tu MailService
  ) {}

  async crearPago(createPagoDto: CreatePagoDto) {
    const { facturaId, monto } = createPagoDto;

    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['cliente'],
    });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    if (factura.estado === EstadoFactura.PAGADO) {
      throw new BadRequestException('La factura ya ha sido pagada');
    }

    const fechaPago = new Date();

    const nuevoPago = this.pagoRepository.create({
      factura,
      monto,
      fechaPago,
    });

    await this.pagoRepository.save(nuevoPago);

    factura.estado = EstadoFactura.PAGADO;
    await this.facturaRepository.save(factura);

    if (!factura.cliente) {
      throw new BadRequestException(
        'El cliente asociado a la factura no existe',
      );
    }

    // Convertir factura.fecha a Date si no lo es
    const fechaFactura =
      factura.fecha instanceof Date ? factura.fecha : new Date(factura.fecha);
    const fechaFormateada = fechaFactura.toISOString().split('T')[0];

    // Generar el PDF de la factura pagada
    const nombreArchivoPdf = await this.pdfService.generarFacturaPDF({
      cliente: factura.cliente.nombre,
      documento: factura.cliente.numeroDocumento,
      plan: factura.cliente.plan?.nombre || 'N/A',
      monto: factura.valor,
      fecha: fechaFormateada,
      estado: factura.estado,
      facturaId: factura.id,
    });
    console.log('PDF generado:', nombreArchivoPdf);

    // Enviar el PDF por correo electrónico usando tu MailService
    try {
      await this.mailService.sendInvoiceEmail(
        factura.cliente.email,
        `Factura pagada - ID: ${factura.id}`,
        `Estimado/a ${factura.cliente.nombre},\n\nGracias por su pago. Adjuntamos la factura correspondiente.\n\nSaludos.`,
        `Factura_${factura.id}.pdf`,
      );
      console.log(`Correo enviado a ${factura.cliente.email}`);
    } catch (error) {
      console.error('Error al enviar correo:', error);
    }

    // ======= SECCIÓN CORREGIDA PARA CREAR NUEVA FACTURA =======
    const fechaBase = new Date(factura.fecha);
    const diaOriginal = fechaBase.getDate();
    const mesOriginal = fechaBase.getMonth();

    fechaBase.setMonth(mesOriginal + 1);

    const ultimoDiaDelMesSiguiente = new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth() + 1,
      0,
    );
    const ultimoDia = ultimoDiaDelMesSiguiente.getDate();

    if (diaOriginal > ultimoDia) {
      fechaBase.setDate(ultimoDia);
    } else {
      fechaBase.setDate(diaOriginal);
    }

    const fechaLimite = new Date(fechaBase);
    fechaLimite.setMonth(fechaBase.getMonth() + 1);

    fechaBase.setHours(0, 0, 0, 0);
    fechaLimite.setHours(0, 0, 0, 0);

    const nuevaFactura = this.facturaRepository.create({
      cliente: factura.cliente,
      concepto: 'servicio de internet',
      fecha: fechaBase.toISOString(),
      fechaLimite: fechaLimite.toISOString(),
      valor: factura.valor,
      estado: EstadoFactura.PENDIENTE,
    });

    await this.facturaRepository.save(nuevaFactura);
    // ======= FIN SECCIÓN =======

    return {
      mensaje:
        'Pago registrado, factura actualizada y factura enviada por correo. Nueva factura generada para el siguiente mes.',
      pago: nuevoPago,
      nuevaFactura,
    };
  }
}
