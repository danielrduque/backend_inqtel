import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaModule } from './factura/factura.module';
import { PlanModule } from './plan/plan.module';
import { UserModule } from './user/user.module'; // Importa el módulo de Usuario (con Client)

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'interchange.proxy.rlwy.net',
      port: 26514,
      username: 'postgres', // cambia esto si usas otro usuario
      password: 'UrnpvoRMnojLdNmcdzJuJKEYGpMwVuoF', // pon tu contraseña
      database: 'railway', // o el nombre que le hayas puesto
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Asegúrate de que todas las entidades estén aquí
      synchronize: true, // solo en desarrollo
    }),
    FacturaModule,
    PlanModule,
    UserModule, // Aquí lo agregas para que el Client esté disponible
  ],
})
export class AppModule {}
