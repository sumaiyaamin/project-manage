import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignee: User;

  @ManyToMany(() => Task)
  @JoinTable({
    name: 'task_dependencies',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'dependency_id', referencedColumnName: 'id' },
  })
  dependencies: Task[];

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  estimatedHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  actualHours: number;

  @Column('simple-array', { nullable: true })
  labels: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
