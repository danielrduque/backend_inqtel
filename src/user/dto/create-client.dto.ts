import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Definir el enum para los tipos de documento válidos
export enum TipoDocumento {
  CEDULA = 'cedula',
  NIT = 'nit',
  CEDULA_EXT = 'cedulaExt',
  REGISTRO_CIVIL = 'registroCivil',
  TARJETA_ID = 'tarjetaId',
  PASAPORTE = 'pasaporte',
  TARJETA_EXT = 'tarjetaExt',
  DOC_EXT = 'docExt',
}

// Definir el enum para los roles válidos
export enum Rol {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateClientDto {
  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumento,
    example: TipoDocumento.CEDULA,
  })
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;

  @ApiProperty({ description: 'Número del documento', example: '1234567890' })
  @IsString()
  numeroDocumento: string;

  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'juan.perez@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Dirección de residencia del cliente',
    example: 'Calle 123 y Avenida Siempre Viva',
  })
  @IsString()
  direccion: string; // 👈 Campo agregado

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  @IsString()
  telefono: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: Rol,
    example: Rol.USER,
    default: Rol.USER,
  })
  @IsOptional()
  @IsEnum(Rol)
  rol: Rol = Rol.USER;

  @ApiPropertyOptional({ description: 'ID del plan asignado', example: 1 })
  @IsOptional()
  @IsNumber()
  planId?: number;
}
