// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientService } from './client.service'; // El servicio para manejar la lógica de cliente

@Module({
  imports: [TypeOrmModule.forFeature([Client])], // Importamos el repositorio de Client
  providers: [ClientService], // Proveemos el servicio de Client
  exports: [ClientService], // Exportamos el servicio para que otros módulos lo usen
})
export class UserModule {}
