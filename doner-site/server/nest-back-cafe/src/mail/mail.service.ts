import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true, // true for port 465
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASS'),
            },
        });
    }

    async sendOrderNotification(order: any) {
        const mailOptions = {
            from: `"Doner Kebab" <${this.configService.get('MAIL_USER')}>`,
            to: 'mxaprostodoxrena@mail.ru', // Always send to this address as requested
            subject: `Новый оплаченный заказ #${order.id}`,
            html: this.generateOrderHtml(order),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    private generateOrderHtml(order: any): string {
        const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} шт.</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price * item.quantity} ₽</td>
      </tr>
    `).join('');

        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Новый заказ #${order.id}</h1>
        </div>
        <div style="padding: 20px;">
          <p>Здравствуйте! Поступил новый оплаченный заказ.</p>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 10px; text-align: left;">Товар</th>
                <th style="padding: 10px; text-align: center;">Кол-во</th>
                <th style="padding: 10px; text-align: right;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 20px 10px 10px; font-weight: bold; text-align: right;">ИТОГО:</td>
                <td style="padding: 20px 10px 10px; font-weight: bold; text-align: right; color: #5e652b; font-size: 20px;">${order.total} ₽</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 10px;">
            <h3 style="margin-top: 0;">Данные клиента:</h3>
            <p style="margin: 5px 0;"><b>Имя:</b> ${order.fullName || 'Не указано'}</p>
            <p style="margin: 5px 0;"><b>Телефон:</b> ${order.phone || 'Не указано'}</p>
            <p style="margin: 5px 0;"><b>Адрес:</b> ${order.address || 'Не указано'}</p>
            <p style="margin: 5px 0;"><b>Комментарий:</b> ${order.comment || 'Нет'}</p>
          </div>
        </div>
        <div style="background: #f1f5f9; padding: 15px; text-align: center; color: #64748b; font-size: 12px;">
          Это автоматическое уведомление от системы Doner Site.
        </div>
      </div>
    `;
    }
}
