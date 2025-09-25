import {
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task Title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Task Description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  dependencyIds?: string[];

  @ApiProperty({ example: '2023-12-31' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}
