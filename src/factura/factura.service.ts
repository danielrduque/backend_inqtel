// src/factura/factura.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UserService } from '../user/user.service'; // Importamos el servicio UserService

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    private userService: UserService,
  ) {}

  // Crear factura
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

  // Buscar facturas por clienteId
  async findByClienteId(clienteId: number): Promise<Factura[]> {
    return this.facturaRepository.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente', 'cliente.plan'],
    });
  }

  // Buscar factura por numeroDocumento del cliente
  async findByNumeroDocumento(numeroDocumento: string): Promise<any> {
    const cliente =
      await this.userService.findByNumeroDocumento(numeroDocumento);

    if (!cliente) {
      return { encontrado: false };
    }

    const facturas = await this.facturaRepository.find({
      where: { cliente: { id: cliente.id } },
      relations: ['cliente', 'cliente.plan'],
    });

    if (facturas.length === 0) {
      return { encontrado: false };
    }

    const factura = facturas[0];

    return {
      nombre: factura.cliente.nombre,
      plan: factura.cliente.plan.nombre,
      precio: factura.valor,
      fechaLimite: factura.fechaLimite,
    };
  }
}
