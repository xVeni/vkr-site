// src/payment/payment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { Order } from '../orders/orders.entity';
import { OrdersModule } from '../orders/orders.module';
import { PaymentController } from './payment.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => OrdersModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }