import {
  NotFoundException,
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Put, // Importar Put
  ParseIntPipe, // Importar ParseIntPipe
  UseGuards, // Importar UseGuards (opcional, para autenticación)
  HttpCode, // Importar HttpCode
  HttpStatus, // Importar HttpStatus
  // ForbiddenException, // Opcional, para lógica de autorización
  // Req, // Opcional, para acceder al objeto request si necesitas info del usuario autenticado
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ChangePasswordDto } from './dto/change-password.dto'; // Importa el nuevo DTO
import { Client } from './entities/client.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ejemplo si tienes un guard JWT

@Controller('clientes')
export class UserController {
  // O ClientController, según tu nomenclatura
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.userService.create(createClientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // O HttpStatus.NO_CONTENT (204) si no devuelves cuerpo
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.userService.remove(id);
    return {
      message: 'Cliente y sus facturas y pagos eliminados correctamente',
    };
  }

  @Get()
  async findAll(): Promise<Client[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Client> {
    const cliente = await this.userService.findOne(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  @Get('documento/:numeroDocumento')
  async findByNumeroDocumento(
    @Param('numeroDocumento') numeroDocumento: string,
  ): Promise<Client> {
    const cliente =
      await this.userService.findByNumeroDocumento(numeroDocumento);
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con número de documento ${numeroDocumento} no encontrado`,
      );
    }
    return cliente;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    return this.userService.update(id, updateClientDto);
  }

  // --- NUEVO ENDPOINT PARA CAMBIAR CONTRASEÑA ---
  @Put(':id/change-password')
  // @UseGuards(JwtAuthGuard) // Ejemplo: Descomenta si usas un guard de autenticación JWT
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    // @Req() req, // Descomenta si necesitas acceder a req.user para autorización
  ): Promise<{ message: string }> {
    // ----- Lógica de Autorización Opcional -----
    // Ejemplo: Asegurarse que el usuario autenticado solo cambie su propia contraseña,
    // o que sea un administrador.
    // const authenticatedUserId = req.user.id; // Suponiendo que tu AuthGuard añade 'user' al request
    // const userRole = req.user.rol;
    // if (authenticatedUserId !== id && userRole !== 'admin') {
    //   throw new ForbiddenException('No tienes permiso para cambiar la contraseña de este usuario.');
    // }
    // ----- Fin Lógica de Autorización Opcional -----

    return this.userService.changePassword(
      id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
