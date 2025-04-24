// src/plan/plan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Client } from '../user/entities/client.entity'; // Importa la entidad Client
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Client]), // Ahora registramos ambos repositorios
  ],
  providers: [PlanService],
  controllers: [PlanController],
  exports: [PlanService], // Exporta solo el servicio
})
export class PlanModule {}
