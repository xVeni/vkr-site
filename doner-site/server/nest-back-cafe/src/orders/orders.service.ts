import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepo: Repository<Order>,
  ) { }

  // Создать новый заказ
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.ordersRepo.create(orderData);
    const savedOrder = await this.ordersRepo.save(order);
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
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.ordersRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }
}
