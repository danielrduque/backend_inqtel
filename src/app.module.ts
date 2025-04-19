import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaModule } from './factura/factura.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // cambia esto si usas otro usuario
      password: '123456789', // pon tu contraseña
      database: 'postgres', // o el nombre que le hayas puesto
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // solo en desarrollo
    }),
    FacturaModule,
  ],
})
export class AppModule {}
