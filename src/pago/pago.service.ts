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

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Client)
    private readonly clienteRepository: Repository<Client>,
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

    // ========== SECCIÓN CORREGIDA ==========
    // Crear la nueva factura usando UTC
    const fechaBase = new Date(factura.fecha);
    const diaOriginalUTC = fechaBase.getUTCDate();
    const mesOriginalUTC = fechaBase.getUTCMonth();

    // Sumar 1 mes en UTC
    fechaBase.setUTCMonth(mesOriginalUTC + 1);

    // Ajustar día si el mes siguiente no lo tiene
    if (fechaBase.getUTCDate() !== diaOriginalUTC) {
      fechaBase.setUTCDate(0); // Retrocede al último día del mes anterior
    }

    // Forzar hora a 00:00:00 UTC
    fechaBase.setUTCHours(0, 0, 0, 0);
    const fechaLimite = new Date(fechaBase);

    // Convertir a ISO String para almacenamiento consistente
    const nuevaFactura = this.facturaRepository.create({
      cliente: factura.cliente,
      concepto: 'servicio de internet',
      fecha: fechaBase.toISOString(),
      fechaLimite: fechaLimite.toISOString(),
      valor: factura.valor,
      estado: EstadoFactura.PENDIENTE,
    });

    await this.facturaRepository.save(nuevaFactura);
    // ========== FIN DE SECCIÓN CORREGIDA ==========

    return {
      mensaje:
        'Pago registrado y factura actualizada. Nueva factura generada para el siguiente mes.',
      pago: nuevoPago,
      nuevaFactura,
    };
  }
}