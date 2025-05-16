// src/plan/dto/create-plan.dto.ts
import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Nombre del plan',
    example: 'Plan Básico 54mbps',
  })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Precio del plan', example: 54000 })
  @IsNumber()
  @IsPositive()
  precio: number;
}
