import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// TODO: реализовать методы модуля "Notifications" по аналогии с ProductsService
// (CRUD, фильтрация, пагинация — см. modules/products для примера)
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
}
