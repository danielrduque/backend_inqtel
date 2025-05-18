// src/factura/entities/factura.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../user/entities/client.entity';
import { Pago } from '../../pago/entities/pago.entity';

// Enum para los estados de la factura
export enum EstadoFactura {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  CANCELADO = 'cancelado',
}

@Entity({ name: 'factura', schema: 'public' }) // Esquema explícito
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'servicio de internet', nullable: false })
  concepto: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'date', nullable: true })
  fechaLimite: Date;

  @ManyToOne(() => Client, (client) => client.facturas, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE', // << Aquí
  })
  @JoinColumn({ name: 'clienteId' })
  cliente: Client;

  // Columna de estado con tipo enum
  @Column({
    type: 'enum',
    enum: EstadoFactura,
    default: EstadoFactura.PENDIENTE, // Estado por defecto
  })
  estado: EstadoFactura;

  // Relación con pagos
  @OneToMany(() => Pago, (pago) => pago.factura, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  pagos: Pago[];
}
