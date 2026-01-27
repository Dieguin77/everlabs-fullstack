import { ICommentsRepository } from '@/domain/repositories/ICommentsRepository.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class DeleteCommentUseCase {
  constructor(
    @inject('CommentsRepository')
    private commentsRepository: ICommentsRepository
  ) {}

  async execute(commentId: number): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    await this.commentsRepository.delete(commentId);
  }
}