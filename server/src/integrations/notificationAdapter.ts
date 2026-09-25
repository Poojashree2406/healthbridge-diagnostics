import { Notification } from '../models/Notification';

export class NotificationAdapter {
  static async sendNotification(params: {
    userId: string;
    title: string;
    message: string;
    type: 'BOOKING' | 'PAYMENT' | 'JOURNEY' | 'REPORT' | 'SYSTEM';
    channel?: 'IN_APP' | 'EMAIL' | 'SMS';
  }) {
    console.log(`[Notification Service - ${params.channel || 'IN_APP'}] To user ${params.userId}: ${params.title} - ${params.message}`);

    const notif = await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      channel: params.channel || 'IN_APP',
      isRead: false
    });

    return notif;
  }
}
