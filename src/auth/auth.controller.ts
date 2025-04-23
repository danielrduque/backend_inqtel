import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Client } from '../user/entities/client.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    const user: Omit<Client, 'password'> = await this.authService.validateUser(
      loginDto.numeroDocumento,
      loginDto.password,
    );
    return this.authService.login(user);
  }
}
