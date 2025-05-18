import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique, // Importa Unique
} from 'typeorm';
import { Factura } from '../../factura/entities/factura.entity';
import { Plan } from '../../plan/entities/plan.entity';

@Entity()
@Unique('UQ_numeroDocumento', ['numeroDocumento']) // Agrega esta línea para que numeroDocumento sea único
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

  @Column({ default: 'activo' })
  estado: string;

  @Column()
  telefono: string;

  @Column()
  direccion: string; //

  // Nuevo campo: password
  @Column()
  password: string; // Campo para la contraseña del cliente

  // Nuevo campo: rol con valor por defecto 'user'
  @Column({ default: 'user' })
  rol: string; // Campo para el rol del cliente

  @OneToMany(() => Factura, (factura) => factura.cliente, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  facturas: Factura[];

  // Relación con Plan
  @ManyToOne(() => Plan, (plan) => plan.clientes, { eager: true })
  @JoinColumn({ name: 'planId' }) // El nombre de la columna que se genera en la tabla Client
  plan: Plan;
}
