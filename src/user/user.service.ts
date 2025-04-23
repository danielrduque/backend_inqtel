import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { Plan } from '../plan/entities/plan.entity';
import * as bcrypt from 'bcrypt'; // Importamos bcrypt para hashear la contraseña

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  // Crear un cliente
  async create(createClientDto: CreateClientDto): Promise<Client> {
    const cliente = new Client();
    cliente.nombre = createClientDto.nombre;
    cliente.tipoDocumento = createClientDto.tipoDocumento;
    cliente.numeroDocumento = createClientDto.numeroDocumento;
    cliente.email = createClientDto.email;
    cliente.telefono = createClientDto.telefono;
    cliente.rol = createClientDto.rol || 'user'; // Asignamos 'user' como rol por defecto

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
    cliente.password = hashedPassword; // Asignamos la contraseña hasheada

    // Aquí buscamos si el planId enviado existe
    if (createClientDto.planId) {
      const plan = await this.planRepository.findOne({
        where: { id: createClientDto.planId },
      });

      if (!plan) {
        throw new NotFoundException(
          `El plan con id ${createClientDto.planId} no fue encontrado.`,
        );
      }

      cliente.plan = plan; // Asignamos el objeto Plan encontrado al cliente
    }

    return this.clientRepository.save(cliente); // Guardamos el cliente con la contraseña hasheada
  }

  // Buscar cliente por ID
  async findOne(id: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id },
      relations: ['plan'], // Cargamos la relación con el plan
    });
  }

  // Método auxiliar para factura.service.ts
  async findOneById(clientId: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['plan'], // Cargamos la relación con el plan
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
