import {
  NotFoundException,
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto'; // <-- Importa el DTO de actualización
import { Client } from './entities/client.entity';

@Controller('clientes')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.userService.create(createClientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.remove(Number(id));
    return {
      message: 'Cliente y sus facturas y pagos eliminados correctamente',
    };
  }

  @Get()
  async findAll(): Promise<Client[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Client> {
    const cliente = await this.userService.findOne(Number(id));
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto, // <-- Usa el DTO correcto aquí
  ): Promise<Client> {
    return this.userService.update(Number(id), updateClientDto);
  }
}
