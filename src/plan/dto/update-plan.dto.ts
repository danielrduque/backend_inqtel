import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiPropertyOptional({
    description: 'Nombre del plan',
    example: 'Plan 160mbps',
  })
  nombre?: string;

  @ApiPropertyOptional({ description: 'Precio del plan', example: 50000 })
  precio?: number;
}
