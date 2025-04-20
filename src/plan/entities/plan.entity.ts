// src/plan/entities/plan.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Client } from '../../user/entities/client.entity';

@Entity({ name: 'plan', schema: 'public' })
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => Client, (client) => client.plan)
  clientes: Client[];
}
