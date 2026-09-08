import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если @Roles(...) не указан — доступ разрешён любому авторизованному пользователю
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;
    if (!jwtUser) throw new ForbiddenException('Non authentifié');

    const user = await this.prisma.user.findUnique({
      where: { id: jwtUser.userId },
      include: { role: true },
    });

    if (!user || !requiredRoles.includes(user.role.name)) {
      throw new ForbiddenException('Droits insuffisants');
    }

    return true;
  }
}
