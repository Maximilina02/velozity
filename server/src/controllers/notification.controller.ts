import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { socketService } from '../services/socket.service';

export class NotificationController {
  public static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;

    const notifications = await prisma.notification.findMany({
      where: { userId: user.userId },
      include: {
        task: {
          select: {
            id: true,
            taskNumber: true,
            title: true,
            projectId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.userId,
        isRead: false,
      },
    });

    sendSuccess(res, { notifications, unreadCount });
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.userId) {
      sendError(res, 'Notification not found', 404, 'NOT_FOUND');
      return;
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.userId, isRead: false },
    });

    // Notify client of updated unread count via WebSocket
    socketService.emitNotification(user.userId, null, unreadCount);

    sendSuccess(res, { unreadCount }, 'Notification marked as read');
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;

    await prisma.notification.updateMany({
      where: {
        userId: user.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Broadcast 0 unread count
    socketService.emitNotification(user.userId, null, 0);

    sendSuccess(res, { unreadCount: 0 }, 'All notifications marked as read');
  }
}
