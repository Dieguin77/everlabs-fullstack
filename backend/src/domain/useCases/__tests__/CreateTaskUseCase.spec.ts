import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTaskUseCase } from '@/domain/useCases/CreateTaskUseCase';
import { ITasksRepository, ICreateTaskDTO } from '@/domain/repositories/ITasksRepository';

const mockTasksRepository: ITasksRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAssignee: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn(),
};

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    createTaskUseCase = new CreateTaskUseCase(mockTasksRepository);
  });

  it('should be able to create a new task', async () => {
    const taskData: ICreateTaskDTO = {
      name: 'Test Task',
      description: 'Test Description',
      priority: 5,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
    };

    const createdTask = {
      id: 1,
      ...taskData,
      status: 'TODO' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.create).mockResolvedValue(createdTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(mockTasksRepository.create).toHaveBeenCalledWith(taskData);
    expect(result.name).toBe(taskData.name);
    expect(result.priority).toBe(taskData.priority);
  });

  it('should not create task with priority below 0', async () => {
    const taskData: ICreateTaskDTO = {
      name: 'Test Task',
      priority: -1,
    };

    await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(
      'Priority must be between 0 and 10'
    );
    expect(mockTasksRepository.create).not.toHaveBeenCalled();
  });

  it('should not create task with priority above 10', async () => {
    const taskData: ICreateTaskDTO = {
      name: 'Test Task',
      priority: 11,
    };

    await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(
      'Priority must be between 0 and 10'
    );
    expect(mockTasksRepository.create).not.toHaveBeenCalled();
  });

  it('should not create task with end date before start date', async () => {
    const taskData: ICreateTaskDTO = {
      name: 'Test Task',
      priority: 5,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-01-01'),
    };

    await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(
      'End date cannot be before start date'
    );
    expect(mockTasksRepository.create).not.toHaveBeenCalled();
  });

  it('should be able to create task without dates', async () => {
    const taskData: ICreateTaskDTO = {
      name: 'Task without dates',
      priority: 3,
    };

    const createdTask = {
      id: 1,
      name: taskData.name,
      priority: taskData.priority,
      status: 'TODO' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.create).mockResolvedValue(createdTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(result.name).toBe(taskData.name);
    expect(mockTasksRepository.create).toHaveBeenCalledWith(taskData);
  });

  it('should be able to assign task to a user', async () => {
    const taskData: ICreateTaskDTO = {
      name: 'Assigned Task',
      priority: 7,
      assigneeId: 2,
    };

    const createdTask = {
      id: 1,
      ...taskData,
      status: 'TODO' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockTasksRepository.create).mockResolvedValue(createdTask);

    const result = await createTaskUseCase.execute(taskData);

    expect(result.assigneeId).toBe(2);
    expect(mockTasksRepository.create).toHaveBeenCalledWith(taskData);
  });
});
