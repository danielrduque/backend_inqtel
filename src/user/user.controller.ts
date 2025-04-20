// src/user/user.controller.ts
import {
  NotFoundException,
  Controller,
  Post,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from './entities/client.entity';

@Controller('clientes')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.userService.create(createClientDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Client> {
    const cliente = await this.userService.findOne(Number(id));
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }
}
