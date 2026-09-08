import { IsOptional, IsString } from 'class-validator';

// Явный список редактируемых текстовых полей сайта — сознательно не
// принимаем произвольный Record<string,string> с фронта, чтобы через
// админку нельзя было напихать в БД что попало под любым ключом.
// Если нужно новое поле — добавить сюда, в SettingsService.KNOWN_KEYS
// и на фронте в форму /admin/settings.
export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  shop_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  hero_title?: string;

  @IsOptional()
  @IsString()
  hero_subtitle?: string;

  @IsOptional()
  @IsString()
  footer_description?: string;
}
