import { User, Project, Task, ActivityLog, NotificationItem, DashboardStats, Client } from '../types';

let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Includes HttpOnly refreshToken cookie
  });

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401 && !options.skipAuthRefresh && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          setAccessToken(refreshData.data.accessToken);
          // Retry original request with new token
          return apiRequest<T>(endpoint, { ...options, skipAuthRefresh: true });
        }
      }
    } catch {
      setAccessToken(null);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).code = data.error?.code;
    (error as any).details = data.error?.details;
    throw error;
  }

  return data.data;
}

// ======================== API Endpoints ========================
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    refresh: () =>
      apiRequest<{ accessToken: string; user: User }>('/auth/refresh', {
        method: 'POST',
        skipAuthRefresh: true,
      }),

    logout: () =>
      apiRequest<null>('/auth/logout', {
        method: 'POST',
        skipAuthRefresh: true,
      }),

    me: () => apiRequest<{ user: User }>('/auth/me'),
  },

  projects: {
    getAll: () => apiRequest<{ projects: Project[] }>('/projects'),
    getById: (id: string) => apiRequest<{ project: Project }>(`/projects/${id}`),
    create: (data: { name: string; description?: string; clientId: string }) =>
      apiRequest<{ project: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<{ name: string; description: string; clientId: string }>) =>
      apiRequest<{ project: Project }>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<null>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  tasks: {
    getAll: (params?: Record<string, string>) => {
      const searchParams = new URLSearchParams(params || {});
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return apiRequest<{ tasks: Task[] }>(`/tasks${query}`);
    },
    getById: (id: string) => apiRequest<{ task: Task }>(`/tasks/${id}`),
    create: (data: {
      title: string;
      description?: string;
      projectId: string;
      priority: string;
      dueDate: string;
      assignedToId?: string | null;
    }) =>
      apiRequest<{ task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<{ task: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      apiRequest<{ task: Task }>(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      apiRequest<null>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  activities: {
    getAll: (limit = 20, since?: string) => {
      const query = new URLSearchParams();
      query.set('limit', String(limit));
      if (since) query.set('since', since);
      return apiRequest<{ activities: ActivityLog[]; meta: any }>(`/activities?${query.toString()}`);
    },
    getForProject: (projectId: string) =>
      apiRequest<{ activities: ActivityLog[] }>(`/activities/project/${projectId}`),
  },

  notifications: {
    getAll: () =>
      apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications'),
    markAsRead: (id: string) =>
      apiRequest<{ unreadCount: number }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllAsRead: () =>
      apiRequest<{ unreadCount: number }>('/notifications/read-all', {
        method: 'POST',
      }),
  },

  dashboard: {
    getStats: () => apiRequest<DashboardStats>('/dashboard/stats'),
  },

  clients: {
    getAll: () => apiRequest<{ clients: (Client & { projects?: { id: string; name: string }[] })[] }>('/clients'),
    create: (data: { name: string; company: string; email: string }) =>
      apiRequest<{ client: Client }>('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<{ name: string; company: string; email: string }>) =>
      apiRequest<{ client: Client }>(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<null>(`/clients/${id}`, {
        method: 'DELETE',
      }),
  },

  users: {
    getDevelopers: () => apiRequest<{ developers: User[] }>('/users/developers'),
    getClients: () => apiRequest<{ clients: Client[] }>('/users/clients'),
    getAll: () => apiRequest<{ users: User[] }>('/users'),
  },
};
