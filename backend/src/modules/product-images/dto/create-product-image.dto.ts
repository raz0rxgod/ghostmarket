import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductImageDto {
  @IsUUID()
  productId: string;

  // URL, полученный ранее от POST /api/uploads/image (поле "url" из ответа)
  @IsString()
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}
