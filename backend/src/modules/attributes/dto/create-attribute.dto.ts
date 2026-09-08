import { IsString, MinLength } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @MinLength(1)
  name: string; // ex. "Couleur", "Mémoire", "Taille d’écran"
}
