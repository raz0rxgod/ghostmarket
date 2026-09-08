import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

// TODO: добавить эндпоинты модуля "Analytics" по аналогии с ProductsController
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
}
