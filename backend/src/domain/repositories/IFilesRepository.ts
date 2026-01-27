import { IFile } from '../entities/interfaces.js';

export interface ICreateFileDTO {
  fileName: string;
  filePath: string;
  taskId: number;
  uploaderId: number;
}

export interface IFilesRepository {
  create(data: ICreateFileDTO): Promise<IFile>;
  findById(id: number): Promise<IFile | null>;
  listByTask(taskId: number): Promise<IFile[]>;
  delete(id: number): Promise<void>;
}
