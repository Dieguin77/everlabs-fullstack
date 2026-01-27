import { ICommentsRepository, ICreateCommentDTO } from '@/domain/repositories/ICommentsRepository.js';
import { ITasksRepository } from '@/domain/repositories/ITasksRepository.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CreateCommentUseCase {
  constructor(
    @inject('CommentsRepository')
    private commentsRepository: ICommentsRepository,

    @inject('TasksRepository')
    private tasksRepository: ITasksRepository
  ) {}

  /**
   * Execute create comment.
   * @param data ICreateCommentDTO
   * @param userRole role of the user creating the comment ('USER' | 'ADMIN')
   */
  async execute(data: ICreateCommentDTO, userRole: string): Promise<void> {
    // Validar existência da tarefa
    const task = await this.tasksRepository.findById(data.taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Permissão: admin pode comentar em qualquer tarefa; user apenas na sua (assignee)
    if (userRole !== 'ADMIN') {
      // Se tarefa não estiver atribuída ao usuário que comenta, negar
      if (!task.assigneeId || task.assigneeId !== data.userId) {
        throw new Error('Not allowed to comment on this task');
      }
    }

    await this.commentsRepository.create(data);
  }
}