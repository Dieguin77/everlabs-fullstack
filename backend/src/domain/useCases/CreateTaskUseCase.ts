import { ITask } from '@/domain/entities/interfaces.js';
import { ITasksRepository, ICreateTaskDTO } from '@/domain/repositories/ITasksRepository.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CreateTaskUseCase {
  constructor(
    @inject('TasksRepository')
    private tasksRepository: ITasksRepository
  ) {}

  async execute(data: ICreateTaskDTO): Promise<ITask> {
    if (data.priority < 0 || data.priority > 10) {
      throw new Error('Priority must be between 0 and 10');
    }

    if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
      throw new Error('End date cannot be before start date');
    }

    const task = await this.tasksRepository.create(data);

    return task;
  }
}