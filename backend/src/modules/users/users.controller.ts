import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/me — профиль + роль текущего пользователя.
  // Используется фронтом для показа/скрытия админки (см. AuthProvider.tsx).
  @Get('me')
  findMe(@CurrentUser() user: JwtUser) {
    return this.usersService.findMe(user.userId);
  }
}
