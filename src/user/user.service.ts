import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { Plan } from '../plan/entities/plan.entity';
import { FacturaService } from '../factura/factura.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @Inject(forwardRef(() => FacturaService))
    private readonly facturaService: FacturaService,
  ) {}

  // Crear un cliente
  async create(createClientDto: CreateClientDto): Promise<Client> {
    const cliente = new Client();
    cliente.nombre = createClientDto.nombre;
    cliente.tipoDocumento = createClientDto.tipoDocumento;
    cliente.numeroDocumento = createClientDto.numeroDocumento;
    cliente.email = createClientDto.email;
    cliente.telefono = createClientDto.telefono;
    cliente.rol = createClientDto.rol || 'user';
    cliente.direccion = createClientDto.direccion;

    const hashedPassword = await bcrypt.hash(
      createClientDto.numeroDocumento,
      10,
    );
    cliente.password = hashedPassword;

    if (createClientDto.planId) {
      const plan = await this.planRepository.findOne({
        where: { id: createClientDto.planId },
      });

      if (!plan) {
        throw new NotFoundException(
          `El plan con id ${createClientDto.planId} no fue encontrado.`,
        );
      }

      cliente.plan = plan;
    }

    const clienteGuardado = await this.clientRepository.save(cliente);

    await this.facturaService.crearFacturaInicial(clienteGuardado);

    return clienteGuardado;
  }

  async update(
    id: number,
    updateClientDto: Partial<CreateClientDto>,
  ): Promise<Client> {
    const cliente = await this.clientRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    if (!updateClientDto) {
      throw new NotFoundException(`Datos para actualizar no proporcionados`);
    }

    if (updateClientDto.nombre !== undefined)
      cliente.nombre = updateClientDto.nombre;
    if (updateClientDto.tipoDocumento !== undefined)
      cliente.tipoDocumento = updateClientDto.tipoDocumento;

    // Si cambió el numeroDocumento, actualizar también la contraseña
    if (updateClientDto.numeroDocumento !== undefined) {
      cliente.numeroDocumento = updateClientDto.numeroDocumento;
      cliente.password = await bcrypt.hash(updateClientDto.numeroDocumento, 10);
    }

    if (updateClientDto.email !== undefined)
      cliente.email = updateClientDto.email;
    if (updateClientDto.telefono !== undefined)
      cliente.telefono = updateClientDto.telefono;
    if (updateClientDto.rol !== undefined) cliente.rol = updateClientDto.rol;
    if (updateClientDto.direccion !== undefined)
      cliente.direccion = updateClientDto.direccion;

    if (updateClientDto.planId !== undefined) {
      const plan = await this.planRepository.findOne({
        where: { id: updateClientDto.planId },
      });
      if (!plan) {
        throw new NotFoundException(
          `Plan con id ${updateClientDto.planId} no encontrado`,
        );
      }
      cliente.plan = plan;
    }

    // Ya no revisamos updateClientDto.password porque no existe
    // Eliminamos esta parte:
    // if (updateClientDto.password !== undefined) {
    //   cliente.password = await bcrypt.hash(updateClientDto.password, 10);
    // }

    return this.clientRepository.save(cliente);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      relations: ['plan'],
    });
  }

  async findOne(id: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id },
      relations: ['plan'],
    });
  }

  async findOneById(clientId: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['plan'],
    });
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { numeroDocumento },
      relations: ['plan'],
    });
  }
}
