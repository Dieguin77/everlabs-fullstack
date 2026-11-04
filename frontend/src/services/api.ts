import { retryWhileWakingUp } from './wakeRetry';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Aborts the request after this long. Without it the browser decides. */
  timeoutMs?: number;
}

/** status 0 means the server could not be reached (network error or timeout). */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// A sleeping free-tier backend shows up as a network error, a timeout or a 502/503/504.
function isTransientError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 0 || [408, 502, 503, 504].includes(error.status));
}

/**
 * Fire-and-forget request to /health so a sleeping backend starts waking up while the
 * visitor is still looking at the login screen. Never blocks the UI and never throws.
 */
export function warmUpBackend(): void {
  try {
    const healthUrl = new URL('/health', API_URL).toString();
    fetch(healthUrl, { cache: 'no-store' }).catch(() => undefined);
  } catch {
    // API_URL is not an absolute URL: nothing to warm up.
  }
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

  const controller = new AbortController();
  const timer = options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : undefined;

  try {
    let response: Response;

    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } catch {
      throw new ApiError('Não foi possível conectar ao servidor.', 0);
    }

    // Error pages from the host (502/503) are not JSON, so parsing must not throw.
    const data = await response.json().catch(() => null);

    if (controller.signal.aborted) {
      throw new ApiError('O servidor demorou demais para responder.', 0);
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || (response.status >= 500 ? 'Servidor indisponível no momento.' : 'Something went wrong'),
        response.status,
      );
    }

    if (data === null) {
      throw new ApiError('Resposta inválida do servidor.', response.status);
    }

    return data;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Auth API
export const authApi = {
  // Retries while a sleeping free-tier backend wakes up (up to ~90 s in total), but fails
  // right away for real answers such as "wrong password" (4xx).
  login: (email: string, password: string, options: { onWaking?: () => void } = {}) =>
    retryWhileWakingUp(
      (timeoutMs) =>
        request<{ data: { user: User; token: string } }>('/users/authenticate', {
          method: 'POST',
          body: { email, password },
          timeoutMs,
        }),
      { onWaking: options.onWaking, isRetryable: isTransientError },
    ),
  
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
