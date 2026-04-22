import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YooCheckout } from '@a2seven/yoo-checkout';
import * as crypto from 'crypto';
import { Order } from '../orders/orders.entity';

@Injectable()
export class PaymentService implements OnModuleInit {
  private yooCheckout: YooCheckout | null = null;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) { }

  onModuleInit() {
    const shopId = process.env.SHOP_ID;
    const secretKey = process.env.API_KEY_PAYMENT;

    if (!shopId || !secretKey) {
      this.logger.warn('ЮKassa не настроена: отсутствуют SHOP_ID или API_KEY_PAYMENT');
      return;
    }

    this.yooCheckout = new YooCheckout({
      shopId,
      secretKey,
    });
  }

  async createPaymentForOrder(order: Order): Promise<{ paymentId: string; confirmationUrl: string }> {
    // ВМЕСТО ЮКАССЫ — РЕДИРЕКТ НА ТЕСТОВУЮ СТРАНИЦУ ОПЛАТЫ
    const paymentId = crypto.randomUUID();
    const confirmationUrl = `/test-payment/${order.id}`;

    order.payment_id = paymentId;
    order.payment_url = confirmationUrl;
    await this.orderRepository.save(order);

    this.logger.log(`[TEST PAYMENT] Создан тестовый платеж для заказа #${order.id}`);

    return {
      paymentId,
      confirmationUrl,
    };
  }

  async handleSimulation(orderId: number) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error(`Заказ с id ${orderId} не найден`);
    }

    if (order.is_paid) {
      return;
    }

    order.is_paid = true;
    order.status = 'paid';
    await this.orderRepository.save(order);

    this.logger.log(`[SIMULATION] Платёж успешно имитирован для заказа #${orderId}`);
  }

  async handleWebhook(data: any) {
    // Сохраняем метод для совместимости, но ЮКасса больше не используется напрямую
    this.logger.log('=== ЮKassa WEBHOOK получен (игнорируется) ===');
  }

}