import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

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
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.page.findMany({ orderBy: { title: 'asc' } });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page introuvable');
    return page;
  }

  async create(dto: CreatePageDto) {
    const baseSlug = slugify(dto.title);
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.page.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }
    return this.prisma.page.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdatePageDto) {
    await this.ensureExists(id);
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.page.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page introuvable');
    return page;
  }
}
