import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto'; // Importa el DTO de actualización
import { Plan } from './entities/plan.entity';

@ApiTags('planes') // Opcional para agrupar en Swagger
@Controller('planes')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.planService.create(createPlanDto);
  }

  @Get()
  findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Plan> {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdatePlanDto }) // Aquí indicas el DTO para Swagger
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdatePlanDto, // Usa el DTO específico
  ): Promise<Plan> {
    return this.planService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.planService.remove(id);
  }
}
