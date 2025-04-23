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
    // Crear la nueva factura con las fechas ajustadas
    const fechaBase = new Date(factura.fecha);
    const diaOriginal = fechaBase.getDate(); // Día de la factura original
    const mesOriginal = fechaBase.getMonth(); // Mes de la factura original

    // Sumar un mes a la fecha
    fechaBase.setMonth(mesOriginal + 1);

    // Obtener el último día del mes siguiente
    const ultimoDiaDelMesSiguiente = new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth() + 1,
      0, // Esto nos da el último día del mes siguiente
    );
    const ultimoDia = ultimoDiaDelMesSiguiente.getDate();

    // Ajustar la fecha: Si el día original es mayor que el último día del mes siguiente,
    // ajustamos al último día de ese mes.
    if (diaOriginal > ultimoDia) {
      fechaBase.setDate(ultimoDia); // Ajuste al último día del mes siguiente
    } else {
      fechaBase.setDate(diaOriginal); // Mantener el mismo día
    }

    // Establecer la fecha límite al último día del mes siguiente
    const fechaLimite = new Date(fechaBase);
    fechaLimite.setMonth(fechaBase.getMonth() + 1);

    // Forzar las horas a 00:00:00 para evitar problemas de horas
    fechaBase.setHours(0, 0, 0, 0);
    fechaLimite.setHours(0, 0, 0, 0);

    // Crear la nueva factura con la nueva fecha y fecha límite
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
