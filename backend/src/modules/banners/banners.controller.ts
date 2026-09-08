import { Controller } from '@nestjs/common';
import { BannersService } from './banners.service';

// TODO: добавить эндпоинты модуля "Banners" по аналогии с ProductsController
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}
}
