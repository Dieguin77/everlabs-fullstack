const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ data: { user: User; token: string } }>('/users/authenticate', {
      method: 'POST',
      body: { email, password },
    }),
  
  register: (name: string, email: string, password: string, role?: string) =>
    request<{ data: User }>('/users', {
      method: 'POST',
      body: { name, email, password, role },
    }),

  getProfile: () =>
    request<{ data: User }>('/users/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ status: string; message: string }>('/users/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    }),
};

// Tasks API
export const tasksApi = {
  list: () =>
    request<{ data: Task[] }>('/tasks'),

  getById: (id: number) =>
    request<{ data: Task }>(`/tasks/${id}`),

  create: (task: CreateTaskDTO) =>
    request<{ data: Task }>('/tasks', {
      method: 'POST',
      body: task,
    }),

  update: (id: number, task: Partial<Task>) =>
    request<{ data: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: task,
    }),

  updateStatus: (id: number, status: TaskStatus) =>
    request<{ data: Task }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};

// Comments API
export const commentsApi = {
  listByTask: (taskId: number) =>
    request<{ data: Comment[] }>(`/tasks/${taskId}/comments`),

  create: (taskId: number, content: string) =>
    request<{ status: string }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: { content },
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/comments/${id}`, {
      method: 'DELETE',
    }),
};

// Users API
export const usersApi = {
  list: () =>
    request<{ data: User[] }>('/users'),
};

// Tags API
export const tagsApi = {
  list: () =>
    request<{ data: Tag[] }>('/tags'),

  create: (name: string) =>
    request<{ data: Tag }>('/tags', {
      method: 'POST',
      body: { name },
    }),
};

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority: number;
  status: TaskStatus;
  assigneeId?: number;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    files: number;
    tags: number;
  };
}

export interface CreateTaskDTO {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority: number;
  assigneeId?: number;
}

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  user?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
}
