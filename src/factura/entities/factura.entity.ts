// src/factura/entities/factura.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'factura', schema: 'public' }) // Especifica el esquema public
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cedula: string;

  @Column()
  nombre: string;

  @Column()
  concepto: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  fecha: Date;
}
