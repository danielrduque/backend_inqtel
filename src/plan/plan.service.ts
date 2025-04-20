// src/plan/plan.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { Client } from '../user/entities/client.entity'; // Importa la entidad Client
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
      relations: ['clientes'], // Cargar los clientes si es necesario
    });

    if (!plan) {
      throw new NotFoundException(`Plan with id ${id} not found`);
    }

    return plan;
  }

  // Optimizado: obtenemos el cliente con su plan en una sola consulta
  async getClientPlan(clientId: number): Promise<Plan> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['plan'], // Cargar el plan relacionado del cliente
    });

    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    if (!client.plan) {
      throw new NotFoundException(
        `Client with id ${clientId} does not have a plan assigned`,
      );
    }

    // El plan está cargado junto con el cliente, por lo que no es necesario hacer una segunda consulta
    return client.plan;
  }
}
