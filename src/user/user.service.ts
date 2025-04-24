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

    @Inject(forwardRef(() => FacturaService)) // ← y aquí
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

    const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
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

    // Crear factura inicial automáticamente
    await this.facturaService.crearFacturaInicial(clienteGuardado);

    return clienteGuardado;
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
