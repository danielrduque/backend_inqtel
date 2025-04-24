// src/shared/shared.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../user/entities/client.entity';
import { Plan } from '../plan/entities/plan.entity';
import { Factura } from '../factura/entities/factura.entity';
import { FacturaService } from '../factura/factura.service';
import { PlanService } from '../plan/plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Plan, Factura])],
  providers: [FacturaService, PlanService],
  exports: [FacturaService, PlanService],
})
export class SharedModule {}
