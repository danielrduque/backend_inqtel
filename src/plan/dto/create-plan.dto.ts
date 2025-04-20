// src/plan/dto/create-plan.dto.ts
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  nombre: string;

  @IsNumber()
  @IsPositive()
  precio: number;
}
