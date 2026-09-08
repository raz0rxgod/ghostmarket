import { Controller } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

// TODO: добавить эндпоинты модуля "Reviews" по аналогии с ProductsController
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
}
