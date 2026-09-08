import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// TODO: реализовать методы модуля "Analytics" по аналогии с ProductsService
// (CRUD, фильтрация, пагинация — см. modules/products для примера)
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}
}
