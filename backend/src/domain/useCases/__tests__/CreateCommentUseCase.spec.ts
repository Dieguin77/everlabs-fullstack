import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateCommentUseCase } from '@/domain/useCases/CreateCommentUseCase';
import { ICommentsRepository, ICreateCommentDTO } from '@/domain/repositories/ICommentsRepository';
import { ITasksRepository } from '@/domain/repositories/ITasksRepository';

const mockCommentsRepository: ICommentsRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  listByTask: vi.fn(),
  delete: vi.fn(),
};

const mockTasksRepository: ITasksRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAssignee: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn(),
};

describe('CreateCommentUseCase', () => {
  let createCommentUseCase: CreateCommentUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    createCommentUseCase = new CreateCommentUseCase(
      mockCommentsRepository,
      mockTasksRepository
    );
  });

  it('should allow admin to comment on any task', async () => {
    const task = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(task);
    vi.mocked(mockCommentsRepository.create).mockResolvedValue({
      id: 1,
      content: 'Admin comment',
      taskId: 1,
      userId: 999,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createCommentUseCase.execute(
      { content: 'Admin comment', taskId: 1, userId: 999 },
      'ADMIN'
    );

    expect(mockCommentsRepository.create).toHaveBeenCalled();
  });

  it('should allow assignee to comment on their task', async () => {
    const task = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(task);
    vi.mocked(mockCommentsRepository.create).mockResolvedValue({
      id: 1,
      content: 'User comment',
      taskId: 1,
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createCommentUseCase.execute(
      { content: 'User comment', taskId: 1, userId: 2 },
      'USER'
    );

    expect(mockCommentsRepository.create).toHaveBeenCalled();
  });

  it('should not allow user to comment on task not assigned to them', async () => {
    const task = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2, // Assigned to user 2
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(task);

    await expect(
      createCommentUseCase.execute(
        { content: 'Unauthorized comment', taskId: 1, userId: 999 }, // User 999
        'USER'
      )
    ).rejects.toThrow('Not allowed to comment on this task');
  });

  it('should throw error when task not found', async () => {
    vi.mocked(mockTasksRepository.findById).mockResolvedValue(null);

    await expect(
      createCommentUseCase.execute(
        { content: 'Comment', taskId: 999, userId: 1 },
        'ADMIN'
      )
    ).rejects.toThrow('Task not found');
  });
});
