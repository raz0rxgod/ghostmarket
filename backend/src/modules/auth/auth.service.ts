import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Un compte avec cet e-mail existe déjà');
    }

    const customerRole = await this.prisma.role.upsert({
      where: { name: 'CUSTOMER' },
      update: {},
      create: { name: 'CUSTOMER' },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: customerRole.id,
      },
    });

    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect');
    }

    return this.issueTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    const saved = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!saved || saved.expiresAt < new Date()) {
      throw new UnauthorizedException('Le jeton de rafraîchissement est invalide');
    }

    // deleteMany вместо delete: если несколько запросов одновременно
    // рефрешат один и тот же токен (гонка на фронте — несколько параллельных
    // authFetch, у каждого свой 401), к моменту выполнения этого запроса
    // токен мог уже быть удалён другим параллельным вызовом. deleteMany не
    // падает, если строк не найдено — просто возвращает count: 0, в отличие
    // от delete(), который бросает P2025 и роняет запрос 500-й ошибкой.
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: { id: saved.id },
    });
    if (count === 0) {
      throw new UnauthorizedException('Le jeton de rafraîchissement est invalide');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: saved.userId },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return this.issueTokens(user.id, user.email);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken
      .delete({ where: { token: refreshToken } })
      .catch(() => undefined);
    return { success: true };
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      },
    );

    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
