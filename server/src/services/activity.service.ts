import { prisma } from '../config/prisma';
import { socketService } from './socket.service';
import { TaskStatus } from '../types';

export interface LogActivityParams {
  action: string;
  details: string;
  prevStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  taskId?: string | null;
  projectId: string;
  userId: string;
}

export class ActivityService {
  public static async log(params: LogActivityParams) {
    const { action, details, prevStatus, newStatus, taskId, projectId, userId } = params;

    // Persist activity directly in PostgreSQL database
    const activity = await prisma.activityLog.create({
      data: {
        action,
        details,
        prevStatus: prevStatus || undefined,
        newStatus: newStatus || undefined,
        taskId: taskId || undefined,
        projectId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        task: {
          select: {
            id: true,
            taskNumber: true,
            title: true,
            assignedToId: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            managerId: true,
          },
        },
      },
    });

    // Determine recipients for role-filtered broadcast
    const projectManagerId = activity.project.managerId;
    const assignedDeveloperId = activity.task?.assignedToId || null;

    // Real-time broadcast strictly filtered by role/ownership
    socketService.emitActivityLogged(activity, projectManagerId, assignedDeveloperId);

    return activity;
  }
}
