import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.favoritesService.findAll(user.userId);
  }

  @Post(':productId')
  add(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.favoritesService.add(user.userId, productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.favoritesService.remove(user.userId, productId);
  }
}
