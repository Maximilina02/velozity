import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;

  public connect(): Socket {
    const token = getAccessToken();

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('/', {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('⚡ [WebSocket] Connected to Velozity Real-Time Engine (id:', this.socket?.id, ')');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('🔌 [WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ [WebSocket] Connection error:', error.message);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public joinProject(projectId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join:project', projectId);
    }
  }

  public leaveProject(projectId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave:project', projectId);
    }
  }
}

export const socketClient = new SocketClient();
