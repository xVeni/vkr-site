import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminController } from './app.admin.controller';
import { AppService } from './app.service';
import { Dish } from './dishes/dishes.entity';
import { Order } from './orders/orders.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DishesModule } from './dishes/dishes.module';
import { OrdersModule } from './orders/orders.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaymentModule } from './payments/payment.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { Settings } from './settings/settings.entity';
import { User } from './users/users.entity';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME,
      entities: [Dish, Order, User, Settings],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'BD_PHOTO'),
      serveRoot: '/images'
    }),
    DishesModule,
    OrdersModule,
    PaymentModule,
    UsersModule,
    AuthModule,
    SettingsModule,
    MailModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule { }
