import { ITag } from '../entities/interfaces.js';

export interface ICreateTagDTO {
  name: string;
}

export interface ITagsRepository {
  create(data: ICreateTagDTO): Promise<ITag>;
  findById(id: number): Promise<ITag | null>;
  findByName(name: string): Promise<ITag | null>;
  list(): Promise<ITag[]>;
  delete(id: number): Promise<void>;
  addToTask(taskId: number, tagId: number): Promise<void>;
  removeFromTask(taskId: number, tagId: number): Promise<void>;
  listByTask(taskId: number): Promise<ITag[]>;
}
