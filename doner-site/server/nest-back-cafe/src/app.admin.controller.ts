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
