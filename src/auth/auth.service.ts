import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../user/entities/client.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private jwtService: JwtService,
  ) {}
  // Método para validar al usuario con numeroDocumento y password
  async validateUser(
    numeroDocumento: string,
    password: string,
  ): Promise<Omit<Client, 'password'>> {
    // Buscar al cliente por el numeroDocumento
    const client = await this.clientRepository.findOne({
      where: { numeroDocumento },
    });

    // Si no se encuentra el cliente, lanzar una excepción de credenciales incorrectas
    if (!client) throw new UnauthorizedException('Credenciales incorrectas');

    // Verificar si la contraseña coincide
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales incorrectas');

    // Excluir la contraseña del objeto retornado
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = client;
    return result;
  }

  // Método de login que genera el JWT
  login(user: Omit<Client, 'password'>) {
    const payload = { sub: user.id, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
