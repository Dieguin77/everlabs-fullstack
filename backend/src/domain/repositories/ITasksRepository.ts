import { ITask } from '../entities/interfaces.js';
import { TaskStatus } from '../entities/types.js';

export interface ICreateTaskDTO {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  assigneeId?: number;
}

export interface IUpdateTaskDTO {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  priority?: number;
  status?: TaskStatus;
  assigneeId?: number;
}

export interface ITasksRepository {
  create(data: ICreateTaskDTO): Promise<ITask>;
  findById(id: number): Promise<ITask | null>;
  findByAssignee(assigneeId: number): Promise<ITask[]>;
  list(): Promise<ITask[]>;
  update(id: number, data: IUpdateTaskDTO): Promise<ITask>;
  updateStatus(id: number, status: TaskStatus): Promise<ITask>;
  delete(id: number): Promise<void>;
}