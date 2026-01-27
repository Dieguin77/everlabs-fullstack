import type { Request, Response } from 'express';
import { container } from 'tsyringe';
import { CreateCommentUseCase } from '@/domain/useCases/CreateCommentUseCase.js';
import { ListCommentsByTaskUseCase } from '@/domain/useCases/ListCommentsByTaskUseCase.js';
import { DeleteCommentUseCase } from '@/domain/useCases/DeleteCommentUseCase.js';
import type { ICommentsRepository } from '@/domain/repositories/ICommentsRepository.js';

export class CommentsController {
  async create(request: Request, response: Response): Promise<Response> {
    const { taskId } = request.params;
    const { content } = request.body;
    const { id: userId, role } = request.user;

    // Se usuário não for admin, validar que é assignee da task — para performance, deixo validação no use case se necessário
    const createComment = container.resolve(CreateCommentUseCase);

  // Create expects userId as part of DTO and userRole as second argument
  await createComment.execute({ content, taskId: Number(taskId), userId }, role);

    return response.status(201).json({ status: 'success' });
  }

  async listByTask(request: Request, response: Response): Promise<Response> {
    const { taskId } = request.params;

    const listComments = container.resolve(ListCommentsByTaskUseCase);

    const comments = await listComments.execute(Number(taskId));

    return response.json({ status: 'success', data: comments });
  }

  async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { id: userId, role } = request.user;

  const commentsRepo = container.resolve<ICommentsRepository>('CommentsRepository');
  const comment = await commentsRepo.findById(Number(id));

    if (!comment) {
      return response.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    // Apenas autor do comentário ou admin pode deletar
    if (comment.userId !== userId && role !== 'ADMIN') {
      return response.status(403).json({ status: 'error', message: 'Not allowed' });
    }

    const deleteComment = container.resolve(DeleteCommentUseCase);
    await deleteComment.execute(Number(id));

    return response.json({ status: 'success', message: 'Deleted' });
  }
}