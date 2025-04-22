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

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
  ) {}

  async crearPago(createPagoDto: CreatePagoDto) {
    const { facturaId, monto } = createPagoDto;

    // Buscar la factura
    const factura = await this.facturaRepository.findOneBy({ id: facturaId });
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    // Verificar si la factura ya está pagada
    if (factura.estado === EstadoFactura.PAGADO) {
      throw new BadRequestException('La factura ya ha sido pagada');
    }

    // Crear el nuevo pago
    const nuevoPago = this.pagoRepository.create({
      factura,
      monto,
      fechaPago: new Date(),
    });

    await this.pagoRepository.save(nuevoPago);

    // Cambiar el estado de la factura a 'pagado'
    factura.estado = EstadoFactura.PAGADO;
    await this.facturaRepository.save(factura);

    return {
      mensaje: 'Pago registrado y factura actualizada',
      pago: nuevoPago,
    };
  }
}
