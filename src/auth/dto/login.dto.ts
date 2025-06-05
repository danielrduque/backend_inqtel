import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Número de documento del usuario',
    example: '1234567890',
  })
  @IsString()
  numeroDocumento: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseñaSegura123',
  })
  @IsString()
  password: string;
}
