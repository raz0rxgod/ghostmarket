import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

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
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({ where: { slug } });
    if (!brand) throw new NotFoundException('Marque introuvable');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.brand.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }
    return this.prisma.brand.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.ensureExists(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.brand.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marque introuvable');
    return brand;
  }
}
