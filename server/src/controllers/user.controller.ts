import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, Role } from '../types';

export class UserController {
  public static async getDevelopers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const developers = await prisma.user.findMany({
      where: { role: Role.DEVELOPER },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, { developers });
  }

  public static async getAllUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, { users });
  }

  public static async getClients(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, { clients });
  }
}
