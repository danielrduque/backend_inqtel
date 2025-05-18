// src/pago/entities/pago.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Factura } from '../../factura/entities/factura.entity';

@Entity()
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  monto: number;

  @Column({ type: 'date' })
  fechaPago: Date;

  @ManyToOne(() => Factura, (factura) => factura.pagos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'facturaId' })
  factura: Factura;

  @Column()
  facturaId: number; // Campo para la relación con Factura
}
