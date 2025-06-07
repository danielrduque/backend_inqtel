import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto'; // Importa el DTO de actualización
import { Plan } from './entities/plan.entity';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('planes') // Opcional para agrupar en Swagger
@Controller('planes')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.planService.create(createPlanDto);
  }

  @Get()
  findAll(): Promise<any[]> {
    return this.planService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Plan> {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBody({ type: UpdatePlanDto }) // Aquí indicas el DTO para Swagger
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdatePlanDto, // Usa el DTO específico
  ): Promise<Plan> {
    return this.planService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.planService.remove(id);
  }
}
