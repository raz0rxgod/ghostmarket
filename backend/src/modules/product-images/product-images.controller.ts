import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  // Публично — используется, например, галереей на странице товара
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productImagesService.findByProduct(productId);
  }

  // Привязать уже загруженный (через POST /uploads/image) файл к товару
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'EDITOR')
  @Post()
  create(@Body() dto: CreateProductImageDto) {
    return this.productImagesService.create(dto);
  }

  // Пересортировка / смена главной картинки
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'EDITOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductImageDto) {
    return this.productImagesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER', 'EDITOR')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productImagesService.remove(id);
  }
}
