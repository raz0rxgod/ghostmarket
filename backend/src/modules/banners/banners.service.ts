import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// TODO: реализовать методы модуля "Banners" по аналогии с ProductsService
// (CRUD, фильтрация, пагинация — см. modules/products для примера)
@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}
}
