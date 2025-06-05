import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../../user/entities/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!, // Asegúrate que JWT_SECRET esté definido en el .env
    });
  }

  async validate(payload: { sub: number; rol: string }) {
    const user = await this.clientRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Retornamos solo los campos necesarios para el contexto de autenticación
    return {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    };
  }
}
