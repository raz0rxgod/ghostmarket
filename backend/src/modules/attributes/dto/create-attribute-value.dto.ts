import { IsString, MinLength } from 'class-validator';

export class CreateAttributeValueDto {
  @IsString()
  @MinLength(1)
  value: string; // ex. "Rouge", "128 Go"
}
