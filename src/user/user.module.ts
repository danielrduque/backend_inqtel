// src/user/user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PlanModule } from '../plan/plan.module'; // Importa PlanModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]), // Define la entidad Client para este módulo
    forwardRef(() => PlanModule), // Usa forwardRef para evitar la dependencia circular
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule], // Exporta el servicio y TypeOrmModule para que el repositorio de Client sea accesible en otros módulos
})
export class UserModule {}
