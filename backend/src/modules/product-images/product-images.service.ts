import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(private readonly prisma: PrismaService) {}

  findByProduct(productId: string) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreateProductImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    const existingCount = await this.prisma.productImage.count({
      where: { productId: dto.productId },
    });

    // Первая картинка товара автоматически становится главной,
    // если явно не указано иное.
    const isMain = dto.isMain ?? existingCount === 0;

    if (isMain) {
      await this.unsetOtherMain(dto.productId);
    }

    return this.prisma.productImage.create({
      data: {
        productId: dto.productId,
        url: dto.url,
        sortOrder: dto.sortOrder ?? existingCount,
        isMain,
      },
    });
  }

  async update(id: string, dto: UpdateProductImageDto) {
    const image = await this.ensureExists(id);

    if (dto.isMain === true) {
      await this.unsetOtherMain(image.productId);
    }

    return this.prisma.productImage.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const image = await this.ensureExists(id);
    await this.prisma.productImage.delete({ where: { id } });

    // Если удалили главную картинку — назначаем главной следующую по сортировке,
    // чтобы у товара с оставшимися фото всегда была ровно одна главная.
    if (image.isMain) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (next) {
        await this.prisma.productImage.update({
          where: { id: next.id },
          data: { isMain: true },
        });
      }
    }

    return { success: true };
  }

  private unsetOtherMain(productId: string) {
    return this.prisma.productImage.updateMany({
      where: { productId, isMain: true },
      data: { isMain: false },
    });
  }

  private async ensureExists(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Image introuvable');
    return image;
  }
}
