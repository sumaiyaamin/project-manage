import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const taskData = {
      ...createTaskDto,
      project: { id: createTaskDto.projectId },
      assignee: createTaskDto.assigneeId ? { id: createTaskDto.assigneeId } : undefined,
      dependencies: createTaskDto.dependencyIds?.map((id) => ({ id })),
    };

    const task = this.taskRepository.create(taskData);
    return this.taskRepository.save(task) as Promise<Task>;
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['project', 'assignee', 'dependencies'],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignee', 'dependencies'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.dependencyIds) {
      // Check for circular dependencies
      if (await this.hasCircularDependency(id, updateTaskDto.dependencyIds)) {
        throw new BadRequestException('Circular dependency detected');
      }
      task.dependencies = updateTaskDto.dependencyIds.map(
        (id) => ({ id }) as any,
      );
    }

    const updatedTask = Object.assign(task, {
      ...updateTaskDto,
      project: updateTaskDto.projectId
        ? { id: updateTaskDto.projectId }
        : task.project,
      assignee: updateTaskDto.assigneeId
        ? { id: updateTaskDto.assigneeId }
        : task.assignee,
    });

    return this.taskRepository.save(updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.softRemove(task);
  }

  async findProjectTasks(projectId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ['assignee', 'dependencies'],
    });
  }

  async getOrderedTasks(projectId: string): Promise<Task[]> {
    const tasks = await this.findProjectTasks(projectId);
    return this.topologicalSort(tasks);
  }

  private async hasCircularDependency(
    taskId: string,
    dependencyIds: string[],
  ): Promise<boolean> {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = async (currentId: string): Promise<boolean> => {
      if (recursionStack.has(currentId)) {
        return true;
      }

      if (visited.has(currentId)) {
        return false;
      }

      visited.add(currentId);
      recursionStack.add(currentId);

      const task = await this.taskRepository.findOne({
        where: { id: currentId },
        relations: ['dependencies'],
      });

      for (const dep of task?.dependencies || []) {
        if (await dfs(dep.id)) {
          return true;
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    for (const depId of dependencyIds) {
      if (await dfs(depId)) {
        return true;
      }
    }

    return false;
  }

  private topologicalSort(tasks: Task[]): Task[] {
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize graph and in-degree
    for (const task of tasks) {
      graph.set(task.id, new Set());
      inDegree.set(task.id, 0);
    }

    // Build graph and calculate in-degree
    for (const task of tasks) {
      for (const dep of task.dependencies || []) {
        graph.get(dep.id)?.add(task.id);
        inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
      }
    }

    // Find tasks with no dependencies
    const queue = tasks
      .filter((task) => (inDegree.get(task.id) || 0) === 0)
      .map((task) => task.id);

    const result: Task[] = [];
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    // Process queue
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentTask = taskMap.get(currentId)!;
      result.push(currentTask);

      for (const neighborId of graph.get(currentId) || []) {
        inDegree.set(neighborId, (inDegree.get(neighborId) || 1) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      }
    }

    return result;
  }
}
