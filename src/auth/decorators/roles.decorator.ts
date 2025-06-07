// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Definimos la clave que usaremos para guardar los metadatos de los roles.
export const ROLES_KEY = 'roles';

// El decorador @Roles(...) que recibirá un array de roles.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
