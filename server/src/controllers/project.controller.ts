import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest, Role } from '../types';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  clientId: z.string().uuid('Invalid client ID'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
  description: z.string().optional(),
  clientId: z.string().uuid('Invalid client ID').optional(),
});

export class ProjectController {
  public static async getProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;

    let whereClause: any = {};

    if (user.role === Role.ADMIN) {
      whereClause = {};
    } else if (user.role === Role.PROJECT_MANAGER) {
      whereClause = { managerId: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      whereClause = {
        tasks: {
          some: {
            assignedToId: user.userId,
          },
        },
      };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, { projects });
  }

  public static async getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
      },
    });

    if (!project) {
      sendError(res, 'Project not found', 404, 'NOT_FOUND');
      return;
    }

    // Role-based access validation
    if (user.role === Role.PROJECT_MANAGER && project.managerId !== user.userId) {
      sendError(res, 'Access denied: You cannot view projects managed by another Project Manager', 403, 'FORBIDDEN');
      return;
    }

    if (user.role === Role.DEVELOPER) {
      const hasAssignedTask = project.tasks.some((t: any) => t.assignedToId === user.userId);
      if (!hasAssignedTask) {
        sendError(res, 'Access denied: You do not have assigned tasks in this project', 403, 'FORBIDDEN');
        return;
      }
      // Developer can only see their own tasks in the project detail
      project.tasks = project.tasks.filter((t: any) => t.assignedToId === user.userId);
    }

    sendSuccess(res, { project });
  }

  public static async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const { name, description, clientId } = req.body;

    const client = await prisma.client.findUnique({
      where: { id: String(clientId) },
    });

    if (!client) {
      sendError(res, 'Client not found', 404, 'CLIENT_NOT_FOUND');
      return;
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId: String(clientId),
        managerId: user.userId,
      },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    sendSuccess(res, { project }, 'Project created successfully', 201);
  }

  public static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);
    const { name, description, clientId } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      sendError(res, 'Project not found', 404, 'NOT_FOUND');
      return;
    }

    // PM can ONLY update projects they created!
    if (user.role === Role.PROJECT_MANAGER && existingProject.managerId !== user.userId) {
      sendError(res, 'Access denied: You cannot edit another Project Manager’s project', 403, 'FORBIDDEN');
      return;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(clientId ? { clientId: String(clientId) } : {}),
      },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    sendSuccess(res, { project: updated }, 'Project updated successfully');
  }

  public static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user!;
    const id = String(req.params.id);

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      sendError(res, 'Project not found', 404, 'NOT_FOUND');
      return;
    }

    if (user.role === Role.PROJECT_MANAGER && existingProject.managerId !== user.userId) {
      sendError(res, 'Access denied: You cannot delete another Project Manager’s project', 403, 'FORBIDDEN');
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Project deleted successfully');
  }
}
