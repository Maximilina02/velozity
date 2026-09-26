import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, Role, TaskStatus } from '../types';
import { socketService } from '../services/socket.service';

export class DashboardController {
  public static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const now = new Date();

    if (user.role === Role.ADMIN) {
      // 1. ADMIN DASHBOARD STATS
      const [
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        inReviewTasks,
        doneTasks,
        overdueCount,
      ] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.count({ where: { status: TaskStatus.TODO } }),
        prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
        prisma.task.count({ where: { status: TaskStatus.IN_REVIEW } }),
        prisma.task.count({ where: { status: TaskStatus.DONE } }),
        prisma.task.count({
          where: {
            OR: [
              { isOverdue: true },
              { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
            ],
          },
        }),
      ]);

      const activeUsersOnline = socketService.getActiveUsersCount();
      const onlineUsersList = socketService.getActiveUsersList();

      sendSuccess(res, {
        role: Role.ADMIN,
        totalProjects,
        totalTasks,
        tasksByStatus: {
          todo: todoTasks,
          inProgress: inProgressTasks,
          inReview: inReviewTasks,
          done: doneTasks,
        },
        overdueTaskCount: overdueCount,
        activeUsersOnline,
        onlineUsersList,
      });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER) {
      // 2. PROJECT MANAGER DASHBOARD STATS
      // End of this current week (Sunday midnight)
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      const [
        myProjects,
        tasksByPriorityRaw,
        upcomingDueTasks,
        overdueTasks,
      ] = await Promise.all([
        prisma.project.findMany({
          where: { managerId: user.userId },
          include: {
            client: true,
            _count: {
              select: { tasks: true },
            },
          },
        }),
        prisma.task.groupBy({
          by: ['priority'],
          where: {
            project: { managerId: user.userId },
          },
          _count: { _all: true },
        }),
        prisma.task.findMany({
          where: {
            project: { managerId: user.userId },
            dueDate: {
              gte: now,
              lte: endOfWeek,
            },
            status: { not: TaskStatus.DONE },
          },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
            project: {
              select: { id: true, name: true },
            },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
        prisma.task.count({
          where: {
            project: { managerId: user.userId },
            OR: [
              { isOverdue: true },
              { dueDate: { lt: now }, status: { not: TaskStatus.DONE } },
            ],
          },
        }),
      ]);

      const priorityMap: Record<string, number> = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      };

      tasksByPriorityRaw.forEach((item) => {
        priorityMap[item.priority] = item._count._all;
      });

      sendSuccess(res, {
        role: Role.PROJECT_MANAGER,
        projectsSummary: {
          totalManagedProjects: myProjects.length,
          projects: myProjects,
        },
        tasksByPriority: priorityMap,
        upcomingDueDatesThisWeek: upcomingDueTasks,
        overdueCount: overdueTasks,
      });
      return;
    }

    if (user.role === Role.DEVELOPER) {
      // 3. DEVELOPER DASHBOARD STATS
      const [assignedTasks, totalAssigned, inProgressCount, doneCount] = await Promise.all([
        prisma.task.findMany({
          where: { assignedToId: user.userId },
          include: {
            project: {
              select: { id: true, name: true },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { dueDate: 'asc' },
          ],
        }),
        prisma.task.count({ where: { assignedToId: user.userId } }),
        prisma.task.count({
          where: { assignedToId: user.userId, status: TaskStatus.IN_PROGRESS },
        }),
        prisma.task.count({
          where: { assignedToId: user.userId, status: TaskStatus.DONE },
        }),
      ]);

      sendSuccess(res, {
        role: Role.DEVELOPER,
        assignedTasks,
        summary: {
          totalAssigned,
          inProgressCount,
          doneCount,
          overdueCount: assignedTasks.filter((t) => t.isOverdue || (t.dueDate < now && t.status !== TaskStatus.DONE)).length,
        },
      });
      return;
    }
  }
}
