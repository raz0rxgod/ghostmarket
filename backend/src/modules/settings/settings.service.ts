import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

// Значения по умолчанию — на случай, если строку в БД ещё не создали
// (сид создаёт только базовые shop_name/phone/email/address).
const DEFAULTS: Record<string, string> = {
  shop_name: 'GhostMarket',
  phone: '+33 1 23 45 67 89',
  email: 'info@example.com',
  address: 'Paris',
  hero_title: 'Bienvenue chez GhostMarket',
  hero_subtitle:
    'High-tech et électronique, sans complications. Choisissez, ajoutez au panier et passez commande en quelques clics.',
  footer_description: 'Prototype de boutique en ligne. Ne constitue pas une offre publique.',
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Публично — тексты сайта нужны на главной, в футере, на контактах.
  async findAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.setting.findMany();
    const fromDb = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULTS, ...fromDb };
  }

  // upsert по каждому переданному полю — поля, которых нет в dto, не трогаем.
  async update(dto: UpdateSettingsDto) {
    const entries = Object.entries(dto).filter(([, value]) => value !== undefined) as [
      string,
      string,
    ][];

    await Promise.all(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return this.findAll();
  }
}
