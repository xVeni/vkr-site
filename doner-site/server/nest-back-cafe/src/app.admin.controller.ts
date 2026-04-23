import { Controller, Get, UseGuards, Query, Post, UseInterceptors, UploadedFile, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdersService } from './orders/orders.service';
import { UsersService } from './users/users.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly usersService: UsersService
    ) { }

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

    @Get('export/:type')
    async exportMetrics(@Param('type') type: string, @Query('period') period: string = 'all', @Res() res: Response) {
        const orders = await this.ordersService.getAll();
        const now = new Date();
        let filteredOrders = orders;

        if (period === 'day' || period === 'today') {
            filteredOrders = orders.filter(o => new Date(o.created_at) > new Date(now.getTime() - 24 * 60 * 60 * 1000));
        } else if (period === 'week') {
            filteredOrders = orders.filter(o => new Date(o.created_at) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        } else if (period === 'month') {
            filteredOrders = orders.filter(o => new Date(o.created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        }

        let csv = '';
        let filename = `${type}_${period}.csv`;

        if (type === 'users') {
            const users = await this.usersService.findAll();
            csv += `Новые пользователи\n`;
            csv += `ID;Имя;Эл.почта;Номер телефона;Роль\n`;
            users.forEach(u => csv += `${u.id};"${u.name || ''}";"${u.email}";"${u.phone || ''}";"${u.role}"\n`);
        } else if (type === 'revenue') {
            const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
            csv += `Общая выручка:; ${totalRevenue} руб.\n`;
            csv += `Кол-во заказов:; ${filteredOrders.length}\n`;
        } else if (type === 'dishes') {
            const itemCounts = {};
            filteredOrders.forEach(o => {
                if (o.items) {
                    o.items.forEach((item: any) => {
                        itemCounts[item.title] = (itemCounts[item.title] || 0) + item.quantity;
                    });
                }
            });
            csv += `Название товара;Количество продано\n`;
            Object.entries(itemCounts).sort((a: any, b: any) => b[1] - a[1]).forEach(([title, qty]) => {
                csv += `"${title}";${qty}\n`;
            });
        } else if (type === 'status') {
            const statusStats = filteredOrders.reduce((acc, o) => {
                acc[o.status] = (acc[o.status] || 0) + 1;
                return acc;
            }, {});
            csv += `Статус;Количество\n`;
            Object.entries(statusStats).forEach(([status, count]) => {
                csv += `"${status}";${count}\n`;
            });
        } else if (type === 'orders') {
            csv += `Всего заказов за период:; ${filteredOrders.length}\n\n`;
            csv += `ID заказа;Дата;Статус;Сумма;Состав заказа;Имя клиента;Телефон;Адрес\n`;
            filteredOrders.forEach(o => {
                const itemsStr = o.items ? o.items.map((i: any) => `${i.title} x${i.quantity}`).join(', ') : '';
                csv += `${o.id};"${new Date(o.created_at).toLocaleString('ru-RU')}";"${o.status}";${o.total};"${itemsStr}";"${o.customer_name || ''}";"${o.phone || ''}";"${o.address || ''}"\n`;
            });
        } else {
            return res.status(400).send('Неверный тип выгрузки');
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv);
    }
}
