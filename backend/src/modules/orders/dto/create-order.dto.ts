import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  deliveryType: string; // livraison à domicile / retrait en magasin / poste
}
