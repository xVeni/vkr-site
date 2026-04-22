import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    const user = this.configService.get('MAIL_USER');
    const pass = this.configService.get('MAIL_PASS');

    console.log(`MailService initialized with User: ${user ? 'present' : 'MISSING'}`);

    this.transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: user,
        pass: pass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      debug: true,
      logger: true, // This will output SMTP stream to console
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendOrderNotification(order: any) {
    console.log(`Attempting to send email for order #${order.id}...`);
    const user = this.configService.get('MAIL_USER');
    const mailOptions = {
      from: `"Doner Site" <${user}>`,
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
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} шт.</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price * item.quantity} ₽</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Новый заказ #${order.id}</h1>
          <p style="margin: 5px 0; opacity: 0.8;">Тип: ${order.type === 'delivery' ? 'Доставка' : 'Самовывоз'}</p>
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
            <p style="margin: 5px 0;"><b>Имя:</b> ${order.customer_name || 'Не указано'}</p>
            <p style="margin: 5px 0;"><b>Телефон:</b> ${order.phone || 'Не указано'}</p>
            <p style="margin: 5px 0;"><b>Адрес:</b> ${order.address || 'Не указано'}</p>
            <p style="margin: 5px 0;"><b>Время:</b> ${order.time || 'Как можно быстрее'}</p>
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
