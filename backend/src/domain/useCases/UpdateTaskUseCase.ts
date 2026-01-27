import { ITask } from '@/domain/entities/interfaces.js';
import { ITasksRepository, IUpdateTaskDTO } from '@/domain/repositories/ITasksRepository.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UpdateTaskUseCase {
  constructor(
    @inject('TasksRepository')
    private tasksRepository: ITasksRepository
  ) {}

  async execute(id: number, data: IUpdateTaskDTO, userId: number, userRole: string): Promise<ITask> {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new Error('Task not found');
    }

    // Apenas admin pode editar qualquer tarefa
    // Usuário normal só pode editar suas próprias tarefas
    if (userRole !== 'ADMIN' && task.assigneeId !== userId) {
      throw new Error('You can only update your own tasks');
    }

    if (data.priority !== undefined && (data.priority < 0 || data.priority > 10)) {
      throw new Error('Priority must be between 0 and 10');
    }

    if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
      throw new Error('End date cannot be before start date');
    }

    // Usuário normal só pode atualizar o status
    if (userRole !== 'ADMIN') {
      const { status, ...rest } = data;
      if (Object.keys(rest).length > 0) {
        throw new Error('You can only update the status of the task');
      }
    }

    const updatedTask = await this.tasksRepository.update(id, data);

    return updatedTask;
  }
}