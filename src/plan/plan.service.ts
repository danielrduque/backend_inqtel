import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { Client } from '../user/entities/client.entity';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find();
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

  // 🟡 NUEVA FUNCIÓN: actualizar un plan
  async update(id: number, updateData: Partial<CreatePlanDto>): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });

    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    Object.assign(plan, updateData);
    return this.planRepository.save(plan);
  }

  // 🔴 NUEVA FUNCIÓN: eliminar un plan
  async remove(id: number): Promise<void> {
    const result = await this.planRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }
  }
}
