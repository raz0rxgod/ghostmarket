import { Controller } from '@nestjs/common';
import { SeoService } from './seo.service';

// TODO: добавить эндпоинты модуля "Seo" по аналогии с ProductsController
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}
}
