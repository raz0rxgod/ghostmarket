import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// TODO: реализовать методы модуля "Search" по аналогии с ProductsService
// (CRUD, фильтрация, пагинация — см. modules/products для примера)
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}
}
