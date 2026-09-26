export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  client?: Client;
  managerId: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
  createdAt?: string;
}

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  projectId: string;
  project?: {
    id: string;
    name: string;
    managerId?: string;
    manager?: { id: string; name: string };
  };
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  activities?: ActivityLog[];
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  prevStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  taskId?: string | null;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    priority?: TaskPriority;
    status?: TaskStatus;
  } | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_IN_REVIEW' | 'TASK_OVERDUE' | 'SYSTEM';
  isRead: boolean;
  taskId?: string | null;
  task?: {
    id: string;
    taskNumber: number;
    title: string;
    projectId: string;
  } | null;
  createdAt: string;
}

export interface AdminStats {
  role: 'ADMIN';
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: {
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
  };
  overdueTaskCount: number;
  activeUsersOnline: number;
  onlineUsersList: {
    userId: string;
    email: string;
    name: string;
    role: Role;
  }[];
}

export interface PMStats {
  role: 'PROJECT_MANAGER';
  projectsSummary: {
    totalManagedProjects: number;
    projects: Project[];
  };
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  upcomingDueDatesThisWeek: Task[];
  overdueCount: number;
}

export interface DeveloperStats {
  role: 'DEVELOPER';
  assignedTasks: Task[];
  summary: {
    totalAssigned: number;
    inProgressCount: number;
    doneCount: number;
    overdueCount: number;
  };
}

export type DashboardStats = AdminStats | PMStats | DeveloperStats;
