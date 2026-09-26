import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import {
  AuthenticatedRequest,
  Role,
  TaskStatus,
  TaskPriority,
} from '../types';
import { ActivityService } from '../services/activity.service';
import { NotificationService } from '../services/notification.service';
import { socketService } from '../services/socket.service';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().default(''),
  projectId: z.string().uuid('Invalid project ID'),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  assignedToId: z.string().uuid('Invalid developer ID').optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date',
    })
    .optional(),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export class TaskController {
  public static async getTasks(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const user = req.user!;
    const { status, priority, dueDateFrom, dueDateTo, projectId } = req.query;

    const where: any = {};

    if (user.role === Role.ADMIN) {
      if (projectId) {
        where.projectId = String(projectId);
      }
    } else if (user.role === Role.PROJECT_MANAGER) {
      where.project = {
        managerId: user.userId,
      };

      if (projectId) {
        where.projectId = String(projectId);
      }
    } else if (user.role === Role.DEVELOPER) {
      where.assignedToId = user.userId;

      if (projectId) {
        where.projectId = String(projectId);
      }
    }

    if (
      status &&
      Object.values(TaskStatus).includes(status as TaskStatus)
    ) {
      where.status = status as TaskStatus;
    }

    if (
      priority &&
      Object.values(TaskPriority).includes(priority as TaskPriority)
    ) {
      where.priority = priority as TaskPriority;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};

      if (dueDateFrom) {
        where.dueDate.gte = new Date(String(dueDateFrom));
      }

      if (dueDateTo) {
        where.dueDate.lte = new Date(String(dueDateTo));
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            managerId: true,
            manager: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    sendSuccess(res, { tasks });
  }

  public static async getTaskById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.managerId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You cannot view tasks from another Project Manager’s project',
        403,
        'FORBIDDEN'
      );
      return;
    }

    if (
      user.role === Role.DEVELOPER &&
      task.assignedToId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You cannot view tasks assigned to other developers',
        403,
        'FORBIDDEN'
      );
      return;
    }

    sendSuccess(res, { task });
  }

  public static async createTask(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const user = req.user!;
    const {
      title,
      description,
      projectId,
      priority,
      dueDate,
      assignedToId,
    } = req.body;

    const project = await prisma.project.findUnique({
      where: {
        id: String(projectId),
      },
    });

    if (!project) {
      sendError(res, 'Project not found', 404, 'NOT_FOUND');
      return;
    }

    if (
      user.role === Role.PROJECT_MANAGER &&
      project.managerId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You can only add tasks to your own projects',
        403,
        'FORBIDDEN'
      );
      return;
    }

    if (assignedToId) {
      const dev = await prisma.user.findUnique({
        where: {
          id: String(assignedToId),
        },
      });

      if (!dev || dev.role !== Role.DEVELOPER) {
        sendError(
          res,
          'Assigned user must be a valid Developer',
          400,
          'INVALID_DEVELOPER'
        );
        return;
      }
    }

    const parsedDueDate = new Date(dueDate);
    const isPastDue = parsedDueDate < new Date();
    const totalTasksCount = await prisma.task.count();

    const task = await prisma.task.create({
      data: {
        taskNumber: totalTasksCount + 1,
        title,
        description,
        projectId: String(projectId),
        priority,
        dueDate: parsedDueDate,
        isOverdue: isPastDue,
        assignedToId: assignedToId
          ? String(assignedToId)
          : undefined,
      },
      include: {
        project: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await ActivityService.log({
      action: 'TASK_CREATED',
      details: `${user.name} created Task #${task.taskNumber} "${task.title}"`,
      taskId: task.id,
      projectId: task.projectId,
      userId: user.userId,
    });

    if (assignedToId) {
      await NotificationService.notify({
        userId: String(assignedToId),
        title: 'New Task Assigned',
        message: `You have been assigned Task #${task.taskNumber}: "${task.title}" in project "${project.name}"`,
        type: 'TASK_ASSIGNED',
        taskId: task.id,
      });

      await ActivityService.log({
        action: 'TASK_ASSIGNED',
        details: `${user.name} assigned Task #${task.taskNumber} to ${
          task.assignedTo?.name || 'developer'
        }`,
        taskId: task.id,
        projectId: task.projectId,
        userId: user.userId,
      });
    }

    socketService.emitTaskUpdated(project.id, task);

    sendSuccess(
      res,
      { task },
      'Task created successfully',
      201
    );
  }

  public static async updateTask(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    const {
      title,
      description,
      priority,
      dueDate,
      assignedToId,
    } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.managerId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You cannot edit tasks in another Project Manager’s project',
        403,
        'FORBIDDEN'
      );
      return;
    }

    if (user.role === Role.DEVELOPER) {
      sendError(
        res,
        'Access denied: Developers can only update task status',
        403,
        'FORBIDDEN'
      );
      return;
    }

    const previousAssigneeId = task.assignedToId;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined
          ? { description }
          : {}),
        ...(priority ? { priority } : {}),
        ...(dueDate
          ? {
              dueDate: new Date(dueDate),
              isOverdue:
                new Date(dueDate) < new Date() &&
                task.status !== TaskStatus.DONE,
            }
          : {}),
        ...(assignedToId !== undefined
          ? {
              assignedToId: assignedToId
                ? String(assignedToId)
                : null,
            }
          : {}),
      },
      include: {
        project: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (
      assignedToId &&
      assignedToId !== previousAssigneeId
    ) {
      await NotificationService.notify({
        userId: String(assignedToId),
        title: 'New Task Assigned',
        message: `You were assigned Task #${updatedTask.taskNumber}: "${updatedTask.title}" in project "${task.project.name}"`,
        type: 'TASK_ASSIGNED',
        taskId: updatedTask.id,
      });

      await ActivityService.log({
        action: 'TASK_ASSIGNED',
        details: `${user.name} reassigned Task #${updatedTask.taskNumber} to ${
          updatedTask.assignedTo?.name || 'developer'
        }`,
        taskId: updatedTask.id,
        projectId: task.projectId,
        userId: user.userId,
      });
    }

    socketService.emitTaskUpdated(
      task.projectId,
      updatedTask
    );

    sendSuccess(
      res,
      { task: updatedTask },
      'Task updated successfully'
    );
  }

  public static async updateTaskStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    // Explicitly type the incoming status as TaskStatus.
    const newStatus: TaskStatus = req.body.status;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: true,
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    if (
      user.role === Role.DEVELOPER &&
      task.assignedToId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You can only update the status of your assigned tasks',
        403,
        'FORBIDDEN'
      );
      return;
    }

    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.managerId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You cannot modify tasks in another Project Manager’s project',
        403,
        'FORBIDDEN'
      );
      return;
    }

    // Explicitly type the previous status as TaskStatus.
    const prevStatus = task.status as TaskStatus;

    if (prevStatus === newStatus) {
      sendSuccess(
        res,
        { task },
        'Status is already set to ' + newStatus
      );
      return;
    }

    const isOverdue =
      newStatus === TaskStatus.DONE
        ? false
        : task.isOverdue;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: newStatus,
        isOverdue,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            managerId: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formatStatus = (s: TaskStatus): string => {
      switch (s) {
        case TaskStatus.TODO:
          return 'To Do';

        case TaskStatus.IN_PROGRESS:
          return 'In Progress';

        case TaskStatus.IN_REVIEW:
          return 'In Review';

        case TaskStatus.DONE:
          return 'Done';

        default:
          return String(s);
      }
    };

    const activityText =
      `${user.name} moved Task #${task.taskNumber} ` +
      `from ${formatStatus(prevStatus)} → ${formatStatus(newStatus)}`;

    await ActivityService.log({
      action: 'STATUS_CHANGE',
      details: activityText,
      prevStatus: prevStatus,
      newStatus: newStatus,
      taskId: task.id,
      projectId: task.projectId,
      userId: user.userId,
    });

    if (newStatus === TaskStatus.IN_REVIEW) {
      await NotificationService.notify({
        userId: task.project.managerId,
        title: 'Task Ready For Review',
        message:
          `${user.name} moved Task #${task.taskNumber} ` +
          `"${task.title}" to In Review for project ` +
          `"${task.project.name}".`,
        type: 'TASK_IN_REVIEW',
        taskId: task.id,
      });
    }

    socketService.emitTaskUpdated(
      task.projectId,
      updatedTask
    );

    sendSuccess(
      res,
      { task: updatedTask },
      'Task status updated'
    );
  }

  public static async deleteTask(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      sendError(res, 'Task not found', 404, 'NOT_FOUND');
      return;
    }

    if (user.role === Role.DEVELOPER) {
      sendError(
        res,
        'Access denied: Developers cannot delete tasks',
        403,
        'FORBIDDEN'
      );
      return;
    }

    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.managerId !== user.userId
    ) {
      sendError(
        res,
        'Access denied: You cannot delete tasks from another PM’s project',
        403,
        'FORBIDDEN'
      );
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    sendSuccess(
      res,
      null,
      'Task deleted successfully'
    );
  }
}