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
import { Client } from '../user/entities/client.entity'; // Asegúrate de importar la entidad Cliente

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,

    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Client)
    private readonly clienteRepository: Repository<Client>, // Asegúrate de tener acceso a Cliente
  ) {}

  async crearPago(createPagoDto: CreatePagoDto) {
    const { facturaId, monto } = createPagoDto;

    // Buscar la factura con el cliente relacionado
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['cliente'],
    });
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

    // Generar una nueva factura para el siguiente mes
    const siguienteMes = new Date();
    siguienteMes.setMonth(siguienteMes.getMonth() + 1); // Sumar un mes a la fecha actual

    // Asegurarse de que la nueva factura tenga la información correcta
    if (!factura.cliente) {
      throw new BadRequestException(
        'El cliente asociado a la factura no existe',
      );
    }

    // Crear una nueva factura con el concepto "servicio de internet"
    const nuevaFactura = this.facturaRepository.create({
      cliente: factura.cliente, // Mantener el mismo cliente
      concepto: 'servicio de internet', // Asignar concepto fijo
      fecha: new Date(), // Usar la fecha actual
      fechaLimite: siguienteMes, // La nueva factura tendrá un límite en el siguiente mes
      valor: factura.valor, // Usar el valor de la factura original
      estado: EstadoFactura.PENDIENTE, // La nueva factura será pendiente
    });

    await this.facturaRepository.save(nuevaFactura);

    return {
      mensaje:
        'Pago registrado y factura actualizada. Nueva factura generada para el siguiente mes.',
      pago: nuevoPago,
      nuevaFactura,
    };
  }
}
