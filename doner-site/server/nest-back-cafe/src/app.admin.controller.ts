import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdersService } from './orders/orders.service';
import { MailService } from './mail/mail.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly mailService: MailService
    ) { }

    @Get('test-email')
    async testEmail() {
        return this.mailService.sendOrderNotification({
            id: 999,
            type: 'delivery',
            customer_name: 'ТЕСТОВЫЙ КЛИЕНТ',
            phone: '+79990000000',
            address: 'Улица Тестовая, дом 1',
            total: 1500,
            items: [
                { title: 'Тестовая Шаурма', quantity: 2, price: 500 },
                { title: 'Тестовый Напиток', quantity: 1, price: 500 }
            ]
        });
    }

    @Get('stats')
    async getStats(@Query('period') period: string = 'all') {
        const orders = await this.ordersService.getAll();
        let filteredOrders = orders;
        const now = new Date();

        if (period === 'day' || period === 'today') {
            filteredOrders = orders.filter(o => new Date(o.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000));
        } else if (period === 'week') {
            filteredOrders = orders.filter(o => new Date(o.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        } else if (period === 'month') {
            filteredOrders = orders.filter(o => new Date(o.created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        }

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const ordersCount = filteredOrders.length;

        // Распределение по статусам
        const statusStats = filteredOrders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});

        // Популярные категории
        const categoryStats = {};
        filteredOrders.forEach(o => {
            if (o.items) {
                o.items.forEach((item: any) => {
                    const cat = item.category || 'General';
                    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
                });
            }
        });

        // Группировка по времени для графиков
        const timeSeries = {};
        filteredOrders.forEach(o => {
            const date = new Date(o.created_at);
            let label = '';
            if (period === 'day' || period === 'today') {
                label = date.getHours() + ':00';
            } else if (period === 'week' || period === 'month') {
                label = date.toLocaleDateString();
            } else {
                label = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
            }

            if (!timeSeries[label]) {
                timeSeries[label] = { label, revenue: 0, orders: 0 };
            }
            timeSeries[label].revenue += Number(o.total || 0);
            timeSeries[label].orders += 1;
        });

        return {
            totalRevenue,
            ordersCount,
            period,
            statusStats,
            categoryStats,
            timeSeries: Object.values(timeSeries)
        };
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './BD_PHOTO',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@UploadedFile() file: any) {
        return {
            url: `/images/${file.filename}`,
        };
    }
}
