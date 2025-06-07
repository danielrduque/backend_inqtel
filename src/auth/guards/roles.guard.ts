// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos desde el decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se especifican roles, la ruta es pública para cualquier usuario autenticado.
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario (y su rol) desde el objeto request
    // Esto funciona porque JwtAuthGuard (que se ejecuta antes) ya ha validado el token
    // y ha adjuntado el usuario a la petición.
    const { user } = context.switchToHttp().getRequest();

    // 3. Comprobar si el rol del usuario está incluido en los roles requeridos
    return requiredRoles.some((role) => user.rol?.includes(role));
  }
}
