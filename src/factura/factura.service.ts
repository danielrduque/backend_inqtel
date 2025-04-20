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
    private userService: UserService, // Inyectamos UserService en lugar de ClientService
  ) {}

  // Método para crear una nueva factura
  async create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    // Usamos el servicio UserService para buscar al cliente
    const cliente = await this.userService.findOne(createFacturaDto.clienteId);

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Creamos la nueva factura asociando el cliente
    const nuevaFactura = this.facturaRepository.create({
      ...createFacturaDto, // Propiedades del DTO
      cliente, // Relacionamos la factura con el cliente
    });

    // Guardamos la factura en la base de datos
    return this.facturaRepository.save(nuevaFactura);
  }

  // Método para buscar facturas por clienteId
  async findByClienteId(clienteId: number): Promise<Factura[]> {
    return this.facturaRepository.find({
      where: {
        cliente: { id: clienteId }, // Usamos la relación con cliente
      },
    });
  }
}
