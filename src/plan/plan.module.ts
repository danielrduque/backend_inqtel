// src/plan/plan.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { UserModule } from '../user/user.module'; // Importa UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan]), // PlanModule importa Plan
    forwardRef(() => UserModule), // Usa forwardRef para evitar la dependencia circular
  ],
  providers: [PlanService],
  controllers: [PlanController],
  exports: [PlanService, TypeOrmModule], // Exporta el servicio y TypeOrmModule para que el repositorio de Plan sea accesible en otros módulos
})
export class PlanModule {}
