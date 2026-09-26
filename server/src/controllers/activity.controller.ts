import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, Role } from '../types';

export class ActivityController {
  public static async getActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const limit = parseInt(String(req.query.limit || '20'), 10);
    const since = req.query.since ? new Date(String(req.query.since)) : undefined;

    let whereClause: any = {};

    // 1. Enforce strict role visibility rules
    if (user.role === Role.ADMIN) {
      // Admin sees activity across all projects (single global activity feed)
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees activity ONLY from their own projects
      whereClause = {
        project: {
          managerId: user.userId,
        },
      };
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees activity ONLY from tasks assigned to them
      whereClause = {
        task: {
          assignedToId: user.userId,
        },
      };
    }

    if (since) {
      whereClause.createdAt = { gt: since };
    }

    // 2. Fetch directly from PostgreSQL database
    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      take: Math.min(limit, 50),
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
            priority: true,
            status: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, {
      activities,
      meta: {
        count: activities.length,
        role: user.role,
        source: 'database',
      },
    });
  }

  public static async getProjectActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const projectId = String(req.params.projectId);
    const limit = parseInt(String(req.query.limit || '20'), 10);

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      sendSuccess(res, { activities: [] });
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && project.managerId !== user.userId) {
      sendSuccess(res, { activities: [] });
      return;
    }

    const activities = await prisma.activityLog.findMany({
      where: {
        projectId,
        ...(user.role === Role.DEVELOPER ? { task: { assignedToId: user.userId } } : {}),
      },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
        task: {
          select: { id: true, taskNumber: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, { activities });
  }
}
