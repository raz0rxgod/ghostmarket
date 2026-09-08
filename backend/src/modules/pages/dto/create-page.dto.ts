import { IsString, MinLength } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  content: string;
}
