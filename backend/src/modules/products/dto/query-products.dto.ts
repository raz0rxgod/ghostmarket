import { IsOptional, IsString, IsUUID, IsNumberString } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'new';

  // Список id значений атрибутов через запятую, напр. "uuid1,uuid2" —
  // товар должен иметь ВСЕ перечисленные значения (AND между ними, в т.ч.
  // между разными атрибутами). Упрощение для тестового прототипа: если
  // выбрать два значения ОДНОГО атрибута (напр. Красный + Синий), это тоже
  // AND — товаров с обоими цветами сразу не будет. Полноценная OR-внутри-
  // атрибута/AND-между-атрибутами логика — следующий шаг, если понадобится.
  @IsOptional()
  @IsString()
  attributeValueIds?: string;
}
