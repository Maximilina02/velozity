import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Contact name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  company: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export class ClientController {
  public static async getClients(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const clients = await prisma.client.findMany({
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, { clients });
  }

  public static async createClient(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, company, email } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        company,
        email,
      },
    });

    sendSuccess(res, { client }, 'Client created successfully', 201);
  }

  public static async updateClient(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params.id);
    const { name, company, email } = req.body;

    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      sendError(res, 'Client not found', 404, 'NOT_FOUND');
      return;
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(company ? { company } : {}),
        ...(email ? { email } : {}),
      },
    });

    sendSuccess(res, { client: updated }, 'Client updated successfully');
  }

  public static async deleteClient(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = String(req.params.id);

    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      sendError(res, 'Client not found', 404, 'NOT_FOUND');
      return;
    }

    await prisma.client.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Client deleted successfully');
  }
}
