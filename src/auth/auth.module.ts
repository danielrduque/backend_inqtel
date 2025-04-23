import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../user/entities/client.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt/jwt.strategy'; // Importa la estrategia JWT
import { JwtAuthGuard } from '../auth/jwt/jwt.guard'; // Importa el guard JWT

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    JwtModule.register({
      secret: 'secreto-ultra-seguro', // Cámbialo por env si es necesario
      signOptions: { expiresIn: '1d' }, // Expiración del token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard], // Agrega JwtStrategy y JwtAuthGuard aquí
})
export class AuthModule {}
