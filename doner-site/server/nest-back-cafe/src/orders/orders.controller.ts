
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { PaymentService } from '../payments/payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
  ) { }

  @Post()
  async create(@Body() orderData: Partial<Order>) {
    // Устанавливаем адрес для самовывоза
    if (orderData.type !== 'delivery') {
      orderData.address = 'Самовывоз';
    }

    // Создаём заказ
    const order = await this.ordersService.createOrder(orderData);

    let paymentUrl: string | null = null;

    // Если онлайн-оплата — создаём платёж
    if (order.paymentMethod === 'online') {
      try {
        const { confirmationUrl } = await this.paymentService.createPaymentForOrder(order);
        paymentUrl = confirmationUrl;
      } catch (error) {
        throw new HttpException(
          'Не удалось создать платёж. Попробуйте позже.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // ЕДИНЫЙ ФОРМАТ ОТВЕТА ДЛЯ ВСЕХ СПОСОБОВ ОПЛАТЫ
    return {
      orderId: order.id,        // ← именно это ждёт фронтенд
      paymentUrl,               // null, если не онлайн
    };
  }


  // Получить все заказы
  @Get()
  getAll(@Query('status') status?: string, @Query('page') page?: string, @Query('limit') limit?: string): Promise<any> {
    if (page && limit) {
      return this.ordersService.getPaginated(status, parseInt(page, 10), parseInt(limit, 10));
    }
    if (status) {
      return this.ordersService.getByStatus(status);
    }
    return this.ordersService.getAll();
  }

  // Получить заказы текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Request() req): Promise<Order[]> {
    return this.ordersService.getOrdersByUser(req.user.id);
  }

  // Обновить статус заказа
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body('status') status: string,
  ): Promise<void> {
    return this.ordersService.updateStatus(id, status);
  }
}