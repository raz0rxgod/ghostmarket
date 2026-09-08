import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  // Публично: список атрибутов со значениями — используется и в
  // фильтрах каталога, и в форме товара в админке.
  findAll() {
    return this.prisma.attribute.findMany({
      include: { values: { orderBy: { value: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async createAttribute(dto: CreateAttributeDto) {
    const exists = await this.prisma.attribute.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Un attribut avec ce nom existe déjà');
    return this.prisma.attribute.create({ data: dto, include: { values: true } });
  }

  async removeAttribute(id: string) {
    await this.ensureAttributeExists(id);
    return this.prisma.attribute.delete({ where: { id } });
  }

  async addValue(attributeId: string, dto: CreateAttributeValueDto) {
    await this.ensureAttributeExists(attributeId);
    const exists = await this.prisma.attributeValue.findFirst({
      where: { attributeId, value: dto.value },
    });
    if (exists) throw new ConflictException('Cette valeur existe déjà pour cet attribut');
    return this.prisma.attributeValue.create({ data: { attributeId, value: dto.value } });
  }

  async removeValue(valueId: string) {
    const value = await this.prisma.attributeValue.findUnique({ where: { id: valueId } });
    if (!value) throw new NotFoundException('Valeur d’attribut introuvable');
    return this.prisma.attributeValue.delete({ where: { id: valueId } });
  }

  private async ensureAttributeExists(id: string) {
    const attribute = await this.prisma.attribute.findUnique({ where: { id } });
    if (!attribute) throw new NotFoundException('Attribut introuvable');
    return attribute;
  }
}
