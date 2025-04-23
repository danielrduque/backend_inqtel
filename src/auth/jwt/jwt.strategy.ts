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
    private clientRepository: Repository<Client>, // Inyecta tu repositorio de clientes
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el JWT del encabezado Authorization
      secretOrKey: 'secreto-ultra-seguro', // Utiliza el mismo secreto que usas para firmar los JWTs
    });
  }

  async validate(payload: any) {
    // Aquí validas el payload del token (decodificado)
    const user = await this.clientRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user; // Retorna el usuario (o lo que necesites) al guard para usarlo en la solicitud
  }
}
