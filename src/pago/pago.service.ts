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
//import { Client } from '../user/entities/client.entity'; // Importar Client
import { PdfService, ClienteParaPDF } from '../pdf/pdf.service';
import { MailService } from '../mail/mail.service';
import { startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    // Si no inyectas ClientRepository aquí, asegúrate de que PagoModule no lo intente importar para este servicio.
    // Si vas a usar clienteRepository directamente (ej this.clienteRepository.findOne(...)), entonces necesitas:
    // @InjectRepository(Client)
    // private readonly clienteRepository: Repository<Client>,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService,
  ) {}

  async getIngresosMensuales(): Promise<number> {
    // ASEGÚRATE QUE ESTE MÉTODO ESTÉ ASÍ
    const inicioMes = startOfMonth(new Date());
    const finMes = endOfMonth(new Date());

    const resultado = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .where('pago.fechaPago BETWEEN :inicio AND :fin', {
        inicio: inicioMes,
        fin: finMes,
      })
      .getRawOne<{ total: string | null }>();

    return Number(resultado?.total) || 0;
  }

  async crearPago(createPagoDto: CreatePagoDto) {
    const { facturaId, monto } = createPagoDto;

    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['cliente', 'cliente.plan'],
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
    if (factura.estado === EstadoFactura.PAGADO) {
      throw new BadRequestException('La factura ya ha sido pagada');
    }
    if (!factura.cliente) {
      throw new BadRequestException(
        'El cliente asociado a la factura no existe.',
      );
    }
    if (!factura.cliente.plan) {
      throw new BadRequestException(
        'El plan del cliente asociado a la factura no existe.',
      );
    }

    const fechaPago = createPagoDto.fechaPago
      ? new Date(createPagoDto.fechaPago)
      : new Date();

    const nuevoPago = this.pagoRepository.create({
      factura,
      facturaId: factura.id,
      monto,
      fechaPago,
    });
    await this.pagoRepository.save(nuevoPago);

    factura.estado = EstadoFactura.PAGADO;
    await this.facturaRepository.save(factura);

    const clienteDataParaPdf: ClienteParaPDF = {
      nombre: factura.cliente.nombre,
      tipoDocumento: factura.cliente.tipoDocumento,
      numeroDocumento: factura.cliente.numeroDocumento,
      email: factura.cliente.email,
      telefono: factura.cliente.telefono,
      direccion: factura.cliente.direccion,
    };

    const fechaFacturaDate =
      factura.fecha instanceof Date ? factura.fecha : new Date(factura.fecha);
    const fechaFacturaFormateada = fechaFacturaDate.toISOString().split('T')[0];
    const fechaLimiteFactura = factura.fechaLimite
      ? (factura.fechaLimite instanceof Date
          ? factura.fechaLimite
          : new Date(factura.fechaLimite)
        )
          .toISOString()
          .split('T')[0]
      : 'N/A';

    const filePathOrFileName = await this.pdfService.generarFacturaPDF({
      cliente: clienteDataParaPdf,
      planNombre: factura.cliente.plan.nombre,
      monto: factura.valor,
      fecha: fechaFacturaFormateada,
      fechaLimite: fechaLimiteFactura,
      estadoFactura: factura.estado as string,
      facturaId: factura.id,
      concepto: factura.concepto,
    });

    const nombreArchivoPdfParaEmail = `factura_${factura.id}.pdf`;
    console.log('PDF generado en:', filePathOrFileName);

    try {
      await this.mailService.sendInvoiceEmail(
        factura.cliente.email,
        `Factura pagada - ID: ${factura.id}`,
        `Estimado/a ${factura.cliente.nombre},\n\nGracias por su pago. Adjuntamos la factura correspondiente.\n\nSaludos.`,
        nombreArchivoPdfParaEmail,
      );
      console.log(`Correo enviado a ${factura.cliente.email}`);
    } catch (error) {
      console.error('Error al enviar correo:', error);
    }

    const fechaBaseNuevaFactura = new Date(factura.fecha);
    const diaOriginalFactura = fechaBaseNuevaFactura.getDate();
    fechaBaseNuevaFactura.setMonth(fechaBaseNuevaFactura.getMonth() + 1);
    const ultimoDiaMesSiguienteNuevaFactura = new Date(
      fechaBaseNuevaFactura.getFullYear(),
      fechaBaseNuevaFactura.getMonth() + 1,
      0,
    ).getDate();
    if (diaOriginalFactura > ultimoDiaMesSiguienteNuevaFactura) {
      fechaBaseNuevaFactura.setDate(ultimoDiaMesSiguienteNuevaFactura);
    } else {
      fechaBaseNuevaFactura.setDate(diaOriginalFactura);
    }
    const fechaLimiteSiguienteFactura = new Date(fechaBaseNuevaFactura);
    fechaLimiteSiguienteFactura.setMonth(fechaBaseNuevaFactura.getMonth() + 1);
    fechaBaseNuevaFactura.setHours(0, 0, 0, 0);
    fechaLimiteSiguienteFactura.setHours(0, 0, 0, 0);

    const nuevaFactura = this.facturaRepository.create({
      cliente: factura.cliente,
      concepto:
        factura.concepto ||
        `Servicio de internet - ${factura.cliente.plan.nombre}`,
      fecha: fechaBaseNuevaFactura,
      fechaLimite: fechaLimiteSiguienteFactura,
      valor: factura.cliente.plan.precio,
      estado: EstadoFactura.PENDIENTE,
    });
    await this.facturaRepository.save(nuevaFactura);

    return {
      mensaje:
        'Pago registrado, factura actualizada y factura enviada por correo. Nueva factura generada para el siguiente mes.',
      pago: nuevoPago,
      nuevaFactura,
    };
  }
}
