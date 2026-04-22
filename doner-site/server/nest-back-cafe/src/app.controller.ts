import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-email-public')
  async testEmailPublic() {
    return this.mailService.sendOrderNotification({
      id: 777,
      type: 'pickup',
      customer_name: 'ПУБЛИЧНЫЙ ТЕСТ (OPEN)',
      phone: '+70000000000',
      address: 'Самовывоз',
      total: 100,
      items: [
        { title: 'Тестовый пирожок', quantity: 1, price: 100 }
      ]
    });
  }
}
