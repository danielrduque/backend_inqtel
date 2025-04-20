import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  // Crear un cliente
  create(createClientDto: CreateClientDto): Promise<Client> {
    const nuevoCliente = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(nuevoCliente);
  }

  // Buscar cliente por ID
  async findOne(id: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id },
    });
  }

  // Método auxiliar para factura.service.ts
  async findOneById(clientId: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id: clientId },
    });
  }

  // Nuevo método: buscar cliente por número de documento
  async findByNumeroDocumento(numeroDocumento: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { numeroDocumento },
      relations: ['plan'], // Cargamos el plan para poder acceder al nombre y precio
    });
  }
}
