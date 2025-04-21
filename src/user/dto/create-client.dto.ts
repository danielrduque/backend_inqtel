// src/user/dto/create-client.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';

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
  @IsString()
  nombre: string;

  // Validar que el tipoDocumento sea uno de los valores definidos en el enum
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;

  @IsString()
  numeroDocumento: string;

  @IsEmail()
  email: string;

  @IsString()
  telefono: string;

  // Campo password - aunque es opcional por ahora
  @IsString()
  password: string;

  // Campo rol con valor por defecto 'user'
  @IsOptional()
  @IsEnum(Rol)
  rol: Rol = Rol.USER; // Valor predeterminado

  @IsOptional()
  @IsNumber()
  planId?: number;
}
