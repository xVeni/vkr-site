import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
    private mailService: MailService,
  ) { }

  // Создать новый заказ
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.ordersRepo.create(orderData);

    // Явно привязываем пользователя, если передан объект с id
    if (orderData.user && (orderData.user as any).id) {
      order.user = orderData.user;
    }

    const savedOrder = await this.ordersRepo.save(order);

    // Если способ оплаты НЕ онлайн, отправляем уведомление сразу
    if (savedOrder.paymentMethod !== 'online') {
      try {
        await this.mailService.sendOrderNotification(savedOrder);
      } catch (e) {
        console.error('Не удалось отправить уведомление о новом заказе:', e);
      }
    }

    return savedOrder;
  }

  // Получить все заказы
  getAll(): Promise<Order[]> {
    return this.ordersRepo.find({
      order: { created_at: 'DESC' }, // сортировка по дате
    });
  }

  // Получить заказы по статусу
  getByStatus(status: string): Promise<Order[]> {
    return this.ordersRepo.find({ where: { status } });
  }

  // Обновить статус заказа
  updateStatus(id: number, status: string): Promise<void> {
    return this.ordersRepo.update(id, { status }).then(() => { });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepo.findOneBy({ id });
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return order;
  }

  // В OrdersService
  async updateAfterPayment(id: number): Promise<void> {
    await this.ordersRepo.update(id, {
      is_paid: true,
      status: 'paid',
    });

    // После оплаты отправляем уведомление на почту
    try {
      const order = await this.ordersRepo.findOne({
        where: { id },
      });
      if (order) {
        await this.mailService.sendOrderNotification(order);
      }
    } catch (e) {
      console.error('Не удалось отправить уведомление о платеже:', e);
    }
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.ordersRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }
}
