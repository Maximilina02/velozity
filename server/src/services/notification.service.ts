import { prisma } from '../config/prisma';
import { socketService } from './socket.service';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_IN_REVIEW' | 'TASK_OVERDUE' | 'SYSTEM';
  taskId?: string;
}

export class NotificationService {
  public static async notify(params: CreateNotificationParams) {
    const { userId, title, message, type, taskId } = params;

    // 1. Store notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        taskId,
      },
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
    });

    // 2. Fetch fresh unread count for this user
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    // 3. Emit real-time notification & count via WebSocket directly to user's private room
    socketService.emitNotification(userId, notification, unreadCount);

    return notification;
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
