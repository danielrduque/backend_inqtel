// src/user/client.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  // Cambié el tipo de retorno a 'Client | null'
  async findOneById(clientId: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id: clientId },
    });
  }
}
