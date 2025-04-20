// src/plan/plan.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { UserModule } from '../user/user.module'; // Importa el módulo que contiene el ClientRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan]), // PlanModule importa Plan
    UserModule, // Asegúrate de importar el UserModule
  ],
  providers: [PlanService],
  controllers: [PlanController],
})
export class PlanModule {}
