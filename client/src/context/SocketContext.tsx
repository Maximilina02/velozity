import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socketClient } from '../services/socket';
import { useAuth } from './AuthContext';
import { ActivityLog, NotificationItem, Task } from '../types';
import { api } from '../services/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
  onlineUsers: { userId: string; email: string; name: string; role: string }[];
  unreadCount: number;
  notifications: NotificationItem[];
  activities: ActivityLog[];
  lastUpdatedTask: Task | null;
  refreshActivities: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [lastUpdatedTask, setLastUpdatedTask] = useState<Task | null>(null);

  // Fetch initial or missed activities directly from Database
  const refreshActivities = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.activities.getAll(20);
      setActivities(data.activities);
    } catch (err) {
      console.error('Failed to fetch activity feed from database:', err);
    }
  }, [user]);

  // Fetch initial notifications
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.notifications.getAll();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      socketClient.disconnect();
      setSocket(null);
      setIsConnected(false);
      setActivities([]);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Connect socket
    const s = socketClient.connect();
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      // Fetch missed events from database upon reconnect
      refreshActivities();
      refreshNotifications();
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Presence update
    const onPresence = (data: { onlineCount: number; onlineUsers: any[] }) => {
      setOnlineCount(data.onlineCount);
      setOnlineUsers(data.onlineUsers || []);
    };

    // Live Activity Log
    const onNewActivity = (activity: ActivityLog) => {
      setActivities((prev) => {
        // Prevent duplicate IDs
        if (prev.some((a) => a.id === activity.id)) return prev;
        return [activity, ...prev].slice(0, 50);
      });
    };

    // Live Task update
    const onTaskUpdated = (task: Task) => {
      setLastUpdatedTask(task);
    };

    // Live Notification
    const onNewNotification = (data: { notification?: NotificationItem; unreadCount: number }) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
      if (data.notification) {
        setNotifications((prev) => [data.notification!, ...prev]);
      }
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('presence:update', onPresence);
    s.on('activity:new', onNewActivity);
    s.on('activity:project', onNewActivity);
    s.on('task:updated', onTaskUpdated);
    s.on('notification:new', onNewNotification);

    // Initial load from database
    refreshActivities();
    refreshNotifications();

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('presence:update', onPresence);
      s.off('activity:new', onNewActivity);
      s.off('activity:project', onNewActivity);
      s.off('task:updated', onTaskUpdated);
      s.off('notification:new', onNewNotification);
    };
  }, [user, refreshActivities, refreshNotifications]);

  const markNotificationRead = async (id: string) => {
    try {
      const res = await api.notifications.markAsRead(id);
      setUnreadCount(res.unreadCount);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineCount,
        onlineUsers,
        unreadCount,
        notifications,
        activities,
        lastUpdatedTask,
        refreshActivities,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
