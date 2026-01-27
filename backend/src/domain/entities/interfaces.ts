import { TaskPriority, TaskStatus } from './types.js';

export interface IUser {
  id: number;
  email: string;
  name?: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  id: number;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFile {
  id: number;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  taskId: number;
  userId: number;
  createdAt: Date;
}

export interface ITag {
  id: number;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface ITaskTag {
  taskId: number;
  tagId: number;
  createdAt: Date;
}