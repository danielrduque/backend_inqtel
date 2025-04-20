// src/user/entities/client.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Factura } from '../../factura/entities/factura.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  cedula: string;

  @Column()
  email: string;

  @Column()
  telefono: string;

  @OneToMany(() => Factura, (factura) => factura.cliente)
  facturas: Factura[];
  plan: any;
}
