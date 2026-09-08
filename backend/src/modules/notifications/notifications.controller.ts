import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// TODO: добавить эндпоинты модуля "Notifications" по аналогии с ProductsController
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
}
