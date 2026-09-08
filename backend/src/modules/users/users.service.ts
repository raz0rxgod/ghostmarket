import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Профиль текущего пользователя + название роли — используется фронтом
  // (AuthProvider) для показа/скрытия админки без похода в БД на каждый чих.
  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const { role, ...rest } = user;
    return { ...rest, role: role.name };
  }
}
