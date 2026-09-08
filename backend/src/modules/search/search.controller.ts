import { Controller } from '@nestjs/common';
import { SearchService } from './search.service';

// TODO: добавить эндпоинты модуля "Search" по аналогии с ProductsController
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
}
