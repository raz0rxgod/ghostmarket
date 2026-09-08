import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
    });
  }

  async add(userId: string, productId: string) {
    await this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    return this.findAll(userId);
  }

  async remove(userId: string, productId: string) {
    await this.prisma.favorite
      .delete({ where: { userId_productId: { userId, productId } } })
      .catch(() => undefined);
    return this.findAll(userId);
  }
}
