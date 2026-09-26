import { Request } from 'express';

export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export const Role = {
  ADMIN: 'ADMIN' as Role,
  PROJECT_MANAGER: 'PROJECT_MANAGER' as Role,
  DEVELOPER: 'DEVELOPER' as Role,
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export const TaskStatus = {
  TODO: 'TODO' as TaskStatus,
  IN_PROGRESS: 'IN_PROGRESS' as TaskStatus,
  IN_REVIEW: 'IN_REVIEW' as TaskStatus,
  DONE: 'DONE' as TaskStatus,
};

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const TaskPriority = {
  LOW: 'LOW' as TaskPriority,
  MEDIUM: 'MEDIUM' as TaskPriority,
  HIGH: 'HIGH' as TaskPriority,
  CRITICAL: 'CRITICAL' as TaskPriority,
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface SocketUser {
  userId: string;
  email: string;
  role: Role;
  name: string;
  socketId: string;
  connectedAt: Date;
}
