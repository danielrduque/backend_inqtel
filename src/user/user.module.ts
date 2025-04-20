// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client])], // Define la entidad Client para este módulo
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule], // Exporta el servicio y TypeOrmModule para que el repositorio de Client sea accesible en otros módulos
})
export class UserModule {}
