import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { Client } from '../user/entities/client.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Factura } from '../factura/entities/factura.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async findAll(): Promise<any[]> {
    const planes = await this.planRepository.find({
      relations: ['clientes'],
    });

    return planes.map((plan) => ({
      id: plan.id,
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio: Number(plan.precio),
      clientCount: plan.clientes?.length || 0,
    }));
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['clientes'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    return plan;
  }

  async getClientPlan(clientId: number): Promise<Plan> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['plan'],
    });

    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    if (!client.plan) {
      throw new NotFoundException(
        `Client with id ${clientId} does not have a plan assigned`,
      );
    }

    return client.plan;
  }

  async actualizarFacturasPendientes(planId: number, nuevoPrecio: number) {
    const facturasPendientes = await this.facturaRepository
      .createQueryBuilder('factura')
      .innerJoin('factura.cliente', 'cliente')
      .innerJoin('cliente.plan', 'plan')
      .where('plan.id = :planId', { planId })
      .andWhere('factura.estado = :estado', { estado: 'pendiente' }) // o usa el enum si tienes uno
      .getMany();

    for (const factura of facturasPendientes) {
      factura.valor = nuevoPrecio;
      await this.facturaRepository.save(factura);
    }
  }

  // 🟡 NUEVA FUNCIÓN: actualizar un plan
  async update(id: number, updateData: Partial<CreatePlanDto>): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });

    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    const precioAnterior = plan.precio;
    const nuevoPrecio = updateData.precio;

    Object.assign(plan, updateData);
    const planActualizado = await this.planRepository.save(plan);

    // Si el precio cambió, actualizar facturas pendientes
    if (nuevoPrecio && nuevoPrecio !== precioAnterior) {
      await this.actualizarFacturasPendientes(plan.id, nuevoPrecio);
    }

    return planActualizado;
  }

  // 🔴 NUEVA FUNCIÓN: eliminar un plan
  async remove(id: number): Promise<void> {
    const result = await this.planRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
  }
}
