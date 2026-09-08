import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // убираем диакритику: é→e, ç→c, à→a и т.д. (важно для FR)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const attributeValueIds = query.attributeValueIds
      ? query.attributeValueIds.split(',').filter(Boolean)
      : [];

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      // См. комментарий в QueryProductsDto: AND по всем переданным id
      ...(attributeValueIds.length > 0
        ? {
            AND: attributeValueIds.map((attributeValueId) => ({
              attributeValues: { some: { attributeValueId } },
            })),
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { price: 'asc' }
        : query.sort === 'price_desc'
          ? { price: 'desc' }
          : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: true,
          brand: true,
          category: true,
          attributeValues: { include: { attributeValue: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        brand: true,
        category: true,
        attributeValues: { include: { attributeValue: { include: { attribute: true } } } },
        reviews: { where: { isApproved: true } },
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async create(dto: CreateProductDto) {
    const baseSlug = slugify(dto.title);
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const { attributeValueIds, ...data } = dto;

    return this.prisma.product.create({
      data: {
        ...data,
        slug,
        ...(attributeValueIds
          ? {
              attributeValues: {
                create: attributeValueIds.map((attributeValueId) => ({ attributeValueId })),
              },
            }
          : {}),
      },
      include: { attributeValues: { include: { attributeValue: true } } },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);
    const { attributeValueIds, ...data } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        // Если attributeValueIds передан (даже пустой массив) — полностью
        // пересобираем связи товара с атрибутами. Если поле не передано в
        // запросе вовсе (undefined) — текущие связи не трогаем.
        ...(attributeValueIds !== undefined
          ? {
              attributeValues: {
                deleteMany: {},
                create: attributeValueIds.map((attributeValueId) => ({ attributeValueId })),
              },
            }
          : {}),
      },
      include: { attributeValues: { include: { attributeValue: true } } },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.product.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }
}
