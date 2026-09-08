import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

// url и productId у картинки не меняются после создания — только пересортировка
// и флаг "главная". Если нужно заменить саму картинку — удалить и создать новую.
export class UpdateProductImageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
