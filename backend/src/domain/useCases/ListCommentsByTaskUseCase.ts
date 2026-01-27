import { ICommentsRepository } from '@/domain/repositories/ICommentsRepository.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ListCommentsByTaskUseCase {
  constructor(
    @inject('CommentsRepository')
    private commentsRepository: ICommentsRepository
  ) {}

  async execute(taskId: number) {
    return this.commentsRepository.listByTask(taskId);
  }
}