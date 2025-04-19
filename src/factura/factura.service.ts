// src/factura/factura.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';

@Injectable()
export class FacturaService {
  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
  ) {}

  create(createFacturaDto: CreateFacturaDto): Promise<Factura> {
    const nuevaFactura = this.facturaRepository.create(createFacturaDto);
    return this.facturaRepository.save(nuevaFactura);
  }

  findByCedula(cedula: string): Promise<Factura[]> {
    return this.facturaRepository.find({ where: { cedula } });
  }
}
