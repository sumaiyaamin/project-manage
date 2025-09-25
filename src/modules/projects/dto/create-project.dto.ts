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
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Project Description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  ownerId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  memberIds?: string[];

  @ApiProperty({ example: '2023-01-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2023-12-31' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
