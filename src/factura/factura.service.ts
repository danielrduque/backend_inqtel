import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, EstadoFactura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UserService } from '../user/user.service';
import { Client } from '../../src/user/entities/client.entity'; // Ajusta la ruta si es diferente

type DatosFacturaDTO =
  | {
      id: number;
      nombre: string;
      plan: string;
      precio: number;
      fechaLimite: Date;
    }
  | { encontrado: false };

@Injectable()
export class FacturaService {
  async findById(id: number): Promise<Factura | null> {
    return this.facturaRepository.findOne({
      where: { id },
      relations: ['cliente', 'cliente.plan'],
    });
  }
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @Inject(forwardRef(() => UserService)) // ← rompe la circularidad aquí
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({
      relations: ['cliente', 'cliente.plan', 'pagos'],
      order: { fecha: 'DESC' },
    });
  }

  // Crear factura
  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const cliente = await this.userService.findOne(createFacturaDto.clienteId);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Aquí ya no usamos fechaEmision, porque no está en la entidad Factura.
    const nuevaFactura = this.facturaRepository.create({
      concepto: `Servicio de internet - ${cliente.plan.nombre}`,
      valor: cliente.plan.precio,
      fecha: new Date(), // Fecha de emisión de la factura
      fechaLimite: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Fecha límite (un mes después)
      estado: EstadoFactura.PENDIENTE, // Estado inicial
      cliente, // Relación con el cliente
    });

    return this.facturaRepository.save(nuevaFactura);
  }

  // Crear factura inicial
  async crearFacturaInicial(cliente: Client): Promise<Factura> {
    const fechaActual = new Date();
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + 1); // Suma un mes

    const nuevaFactura = this.facturaRepository.create({
      cliente: cliente, // Relación con el cliente
      valor: cliente.plan.precio, // Usamos el precio del plan (mejor que || para evitar errores con 0)
      estado: EstadoFactura.PENDIENTE,
      fecha: fechaActual,
      fechaLimite: fechaLimite,
    });

    return this.facturaRepository.save(nuevaFactura);
  }

  async findAllByClienteId(clienteId: number): Promise<Factura[]> {
    return this.facturaRepository.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente', 'cliente.plan', 'pagos'], // 👈 aquí agregamos los pagos
      order: { fecha: 'DESC' },
    });
  }

  // Buscar factura pendiente por cliente
  async findByClienteId(
    clienteId: number,
  ): Promise<Factura | { encontrado: false }> {
    const facturaPendiente = await this.facturaRepository.findOne({
      where: {
        cliente: { id: clienteId },
        estado: EstadoFactura.PENDIENTE,
      },
      relations: ['cliente', 'cliente.plan'],
      order: { fechaLimite: 'DESC' },
    });

    return facturaPendiente || { encontrado: false };
  }

  // Buscar factura pendiente por número de documento
  async findByNumeroDocumento(
    numeroDocumento: string,
  ): Promise<DatosFacturaDTO> {
    const cliente =
      await this.userService.findByNumeroDocumento(numeroDocumento);

    if (!cliente) {
      return { encontrado: false };
    }

    const factura = await this.facturaRepository.findOne({
      where: {
        cliente: { id: cliente.id },
        estado: EstadoFactura.PENDIENTE,
      },
      relations: ['cliente', 'cliente.plan'],
      order: { fechaLimite: 'DESC' },
    });

    if (!factura) {
      return { encontrado: false };
    }

    return {
      id: factura.id,
      nombre: factura.cliente.nombre,
      plan: factura.cliente.plan.nombre,
      precio: factura.cliente.plan.precio,
      fechaLimite: factura.fechaLimite,
    };
  }
}
