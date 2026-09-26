import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token';
import { Role, TokenPayload } from '../types';

interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  // Map of userId to Set of socketIds (handles multiple tabs/devices)
  private activeUsers = new Map<string, { user: TokenPayload; socketIds: Set<string> }>();

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public init(httpServer: HttpServer, clientUrl: string): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      pingTimeout: 20000,
      pingInterval: 10000,
    });

    // Authentication middleware for socket connections
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      try {
        const payload = verifyAccessToken(token);
        socket.user = payload;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const user = socket.user;
      if (!user) {
        socket.disconnect(true);
        return;
      }

      // Add to active users tracking
      const existing = this.activeUsers.get(user.userId);
      if (existing) {
        existing.socketIds.add(socket.id);
      } else {
        this.activeUsers.set(user.userId, {
          user,
          socketIds: new Set([socket.id]),
        });
      }

      // Join private user room for direct notifications
      socket.join(`user:${user.userId}`);

      // Join role-based rooms
      socket.join(`role:${user.role}`);

      // Broadcast updated online presence to all (especially Admin dashboard)
      this.broadcastPresence();

      // Client can subscribe to specific project updates
      socket.on('join:project', (projectId: string) => {
        socket.join(`project:${projectId}`);
      });

      socket.on('leave:project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
      });

      socket.on('disconnect', () => {
        const userEntry = this.activeUsers.get(user.userId);
        if (userEntry) {
          userEntry.socketIds.delete(socket.id);
          if (userEntry.socketIds.size === 0) {
            this.activeUsers.delete(user.userId);
          }
        }
        this.broadcastPresence();
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized');
    }
    return this.io;
  }

  public getActiveUsersCount(): number {
    return this.activeUsers.size;
  }

  public getActiveUsersList() {
    return Array.from(this.activeUsers.values()).map((u) => ({
      userId: u.user.userId,
      email: u.user.email,
      name: u.user.name,
      role: u.user.role,
    }));
  }

  public broadcastPresence(): void {
    if (!this.io) return;
    const count = this.getActiveUsersCount();
    const users = this.getActiveUsersList();

    this.io.emit('presence:update', {
      onlineCount: count,
      onlineUsers: users,
    });
  }

  /**
   * Broadcast real-time activity log strictly role-filtered:
   * - Admin: sees all events in global feed
   * - PM: sees events from their managed projects
   * - Dev: sees events for tasks assigned to them
   * - Active project viewers: anyone viewing the specific project
   */
  public emitActivityLogged(activity: any, projectManagerId: string, assignedDeveloperId?: string | null): void {
    if (!this.io) return;

    // 1. Emit to Admins
    this.io.to('role:ADMIN').emit('activity:new', activity);

    // 2. Emit to the specific Project Manager who owns the project
    if (projectManagerId) {
      this.io.to(`user:${projectManagerId}`).emit('activity:new', activity);
    }

    // 3. Emit to the Developer assigned to this task (if any)
    if (assignedDeveloperId && assignedDeveloperId !== projectManagerId) {
      this.io.to(`user:${assignedDeveloperId}`).emit('activity:new', activity);
    }

    // 4. Emit to all users currently viewing this project room
    this.io.to(`project:${activity.projectId}`).emit('activity:project', activity);
  }

  /**
   * Broadcast real-time task update to all viewers of the project
   */
  public emitTaskUpdated(projectId: string, task: any): void {
    if (!this.io) return;
    this.io.to(`project:${projectId}`).emit('task:updated', task);
    this.io.to('role:ADMIN').emit('task:updated', task);
  }

  /**
   * Direct user notification with real-time count
   */
  public emitNotification(userId: string, notification: any, unreadCount: number): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit('notification:new', {
      notification,
      unreadCount,
    });
  }
}

export const socketService = SocketService.getInstance();
