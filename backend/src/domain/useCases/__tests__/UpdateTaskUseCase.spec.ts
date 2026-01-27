import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTaskUseCase } from '@/domain/useCases/UpdateTaskUseCase';
import { ITasksRepository, IUpdateTaskDTO } from '@/domain/repositories/ITasksRepository';

const mockTasksRepository: ITasksRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAssignee: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn(),
};

describe('UpdateTaskUseCase', () => {
  let updateTaskUseCase: UpdateTaskUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    updateTaskUseCase = new UpdateTaskUseCase(mockTasksRepository);
  });

  it('should allow admin to update any task', async () => {
    const existingTask = {
      id: 1,
      name: 'Old Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData: IUpdateTaskDTO = {
      name: 'Updated Task',
      priority: 8,
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(existingTask);
    vi.mocked(mockTasksRepository.update).mockResolvedValue({
      ...existingTask,
      ...updateData,
    });

    const result = await updateTaskUseCase.execute(1, updateData, 999, 'ADMIN');

    expect(mockTasksRepository.update).toHaveBeenCalledWith(1, updateData);
    expect(result.name).toBe('Updated Task');
  });

  it('should not allow regular user to update task not assigned to them', async () => {
    const existingTask = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2, // Assigned to user 2
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(existingTask);

    await expect(
      updateTaskUseCase.execute(1, { status: 'IN_PROGRESS' }, 999, 'USER') // User 999 trying to update
    ).rejects.toThrow('You can only update your own tasks');
  });

  it('should allow user to update only status of their own task', async () => {
    const existingTask = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(existingTask);
    vi.mocked(mockTasksRepository.update).mockResolvedValue({
      ...existingTask,
      status: 'IN_PROGRESS' as const,
    });

    const result = await updateTaskUseCase.execute(
      1,
      { status: 'IN_PROGRESS' },
      2, // Same user as assignee
      'USER'
    );

    expect(result.status).toBe('IN_PROGRESS');
  });

  it('should not allow user to update fields other than status', async () => {
    const existingTask = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      assigneeId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(existingTask);

    await expect(
      updateTaskUseCase.execute(
        1,
        { name: 'New Name', status: 'IN_PROGRESS' }, // Trying to change name
        2,
        'USER'
      )
    ).rejects.toThrow('You can only update the status of the task');
  });

  it('should throw error when task not found', async () => {
    vi.mocked(mockTasksRepository.findById).mockResolvedValue(null);

    await expect(
      updateTaskUseCase.execute(999, { status: 'DONE' }, 1, 'ADMIN')
    ).rejects.toThrow('Task not found');
  });

  it('should validate priority range on update', async () => {
    const existingTask = {
      id: 1,
      name: 'Task',
      priority: 5,
      status: 'TODO' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.findById).mockResolvedValue(existingTask);

    await expect(
      updateTaskUseCase.execute(1, { priority: 15 }, 1, 'ADMIN')
    ).rejects.toThrow('Priority must be between 0 and 10');
  });
});
