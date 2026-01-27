import { IComment } from '../entities/interfaces.js';

export interface ICreateCommentDTO {
  content: string;
  taskId: number;
  userId: number;
}

export interface ICommentsRepository {
  create(data: ICreateCommentDTO): Promise<IComment>;
  findById(id: number): Promise<IComment | null>;
  listByTask(taskId: number): Promise<IComment[]>;
  delete(id: number): Promise<void>;
}