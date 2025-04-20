// src/user/entities/client.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Factura } from '../../factura/entities/factura.entity';
import { Plan } from '../../plan/entities/plan.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tipoDocumento: string;

  @Column()
  numeroDocumento: string;

  @Column()
  email: string;

  @Column()
  telefono: string;

  @OneToMany(() => Factura, (factura) => factura.cliente)
  facturas: Factura[];

  // Relación con Plan
  @ManyToOne(() => Plan, (plan) => plan.clientes, { eager: true })
  @JoinColumn({ name: 'planId' }) // El nombre de la columna que se genera en la tabla Client
  plan: Plan;
}
