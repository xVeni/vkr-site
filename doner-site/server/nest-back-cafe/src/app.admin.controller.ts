import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { OrdersService } from './orders/orders.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get('stats')
    async getStats(@Query('period') period: string = 'all') {
        const orders = await this.ordersService.getAll();
        let filteredOrders = orders;
        const now = new Date();

        if (period === 'day') {
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

        // Популярные категории (из элементов заказов)
        const categoryStats = {};
        filteredOrders.forEach(o => {
            if (o.items) {
                o.items.forEach((item: any) => {
                    const cat = item.category || 'General';
                    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
                });
            }
        });

        return {
            totalRevenue,
            ordersCount,
            period,
            statusStats,
            categoryStats
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
