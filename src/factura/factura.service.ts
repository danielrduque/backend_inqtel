// src/factura/factura.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, EstadoFactura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UserService } from '../user/user.service';

type DatosFacturaDTO =
  | {
      id: number; // <- agregado
      nombre: string;
      plan: string;
      precio: number;
      fechaLimite: Date;
    }
  | { encontrado: false };

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    private userService: UserService,
  ) {}

  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const cliente = await this.userService.findOne(createFacturaDto.clienteId);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const nuevaFactura = this.facturaRepository.create({
      ...createFacturaDto,
      cliente,
    });

    return this.facturaRepository.save(nuevaFactura);
  }

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
      id: factura.id, // <- agregado aquí
      nombre: factura.cliente.nombre,
      plan: factura.cliente.plan.nombre,
      precio: factura.valor,
      fechaLimite: factura.fechaLimite,
    };
  }
}
