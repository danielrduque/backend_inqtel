import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  UnauthorizedException, // Para errores de contraseña actual incorrecta
  BadRequestException, // Para validaciones de nueva contraseña
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto'; // Asumo que tienes un DTO similar para ChangePasswordDto o usas campos sueltos
import { Plan } from '../plan/entities/plan.entity';
import { FacturaService } from '../factura/factura.service';
import { Factura } from '../factura/entities/factura.entity'; // Corregido el path si es necesario
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,

    @Inject(forwardRef(() => FacturaService))
    private readonly facturaService: FacturaService,
  ) {}

  // --- Métodos existentes (create, remove, update, findAll, findOne, etc.) ---
  // ... (tu código existente va aquí)

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const cliente = new Client();
    cliente.nombre = createClientDto.nombre;
    cliente.tipoDocumento = createClientDto.tipoDocumento;
    cliente.numeroDocumento = createClientDto.numeroDocumento;
    cliente.email = createClientDto.email;
    cliente.telefono = createClientDto.telefono;
    cliente.rol = createClientDto.rol || 'user';
    cliente.direccion = createClientDto.direccion;
    cliente.estado = createClientDto.estado || 'activo'; // Valor por defecto si no viene

    const hashedPassword = await bcrypt.hash(
      createClientDto.numeroDocumento, // La contraseña inicial sigue siendo el número de documento
      10,
    );
    cliente.password = hashedPassword;

    cliente.fechaRegistro = new Date();

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
    // Asumo que crearFacturaInicial es un método que existe en tu FacturaService
    await this.facturaService.crearFacturaInicial(clienteGuardado);
    return clienteGuardado;
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.clientRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    await this.clientRepository.remove(cliente);
  }

  async update(
    id: number,
    updateClientDto: Partial<CreateClientDto>,
  ): Promise<Client> {
    const cliente = await this.clientRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    // No permitir que 'updateClientDto' esté completamente vacío
    if (Object.keys(updateClientDto).length === 0) {
      throw new BadRequestException(
        'No se proporcionaron datos para actualizar.',
      );
    }

    // Actualizar campos si se proporcionan
    if (updateClientDto.nombre !== undefined)
      cliente.nombre = updateClientDto.nombre;
    if (updateClientDto.tipoDocumento !== undefined)
      cliente.tipoDocumento = updateClientDto.tipoDocumento;

    // Si cambió el numeroDocumento, NO actualizar la contraseña aquí automáticamente.
    // El cambio de contraseña es una operación separada y más segura.
    if (updateClientDto.numeroDocumento !== undefined)
      cliente.numeroDocumento = updateClientDto.numeroDocumento;

    if (updateClientDto.email !== undefined)
      cliente.email = updateClientDto.email;
    if (updateClientDto.telefono !== undefined)
      cliente.telefono = updateClientDto.telefono;
    if (updateClientDto.rol !== undefined) cliente.rol = updateClientDto.rol;
    if (updateClientDto.direccion !== undefined)
      cliente.direccion = updateClientDto.direccion;
    if (updateClientDto.estado !== undefined)
      cliente.estado = updateClientDto.estado;

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

      await this.facturaRepository
        .createQueryBuilder()
        .update(Factura)
        .set({
          valor: plan.precio,
        })
        .where('clienteId = :clienteId', { clienteId: cliente.id })
        .andWhere('estado != :estadoPagada', { estadoPagada: 'pagado' })
        .execute();
    }
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
    const cliente = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['plan'],
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clientId} no encontrado.`);
    }
    return cliente;
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { numeroDocumento },
      relations: ['plan'],
    });
  }

  // --- NUEVO MÉTODO PARA CAMBIAR CONTRASEÑA ---
  /**
   * Cambia la contraseña de un cliente existente.
   * @param clientId El ID del cliente.
   * @param currentPassword La contraseña actual del cliente.
   * @param newPassword La nueva contraseña deseada.
   * @returns Una promesa con el cliente actualizado o un mensaje de éxito.
   */
  async changePassword(
    clientId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Puedes devolver el Client si prefieres
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'La contraseña actual y la nueva son requeridas.',
      );
    }

    const cliente = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${clientId} no encontrado.`);
    }

    // Verificar la contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, cliente.password);
    if (!isMatch) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    // Validar la nueva contraseña (ejemplo básico: longitud mínima)
    if (newPassword.length < 8) {
      // Podrías tener validaciones más complejas aquí (mayúsculas, números, etc.)
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      );
    }

    if (newPassword === currentPassword) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la contraseña actual.',
      );
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    cliente.password = await bcrypt.hash(newPassword, salt);

    // Guardar los cambios en el cliente (solo la contraseña actualizada)
    await this.clientRepository.save(cliente);

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
