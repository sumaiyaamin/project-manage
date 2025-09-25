import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new task' })
  @ApiResponse({ status: 201, description: 'Task successfully created.' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks or project tasks' })
  @ApiResponse({ status: 200, description: 'Return all tasks.' })
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.tasksService.findProjectTasks(projectId);
    }
    return this.tasksService.findAll();
  }

  @Get('ordered/:projectId')
  @ApiOperation({ summary: 'Get ordered tasks by dependencies' })
  @ApiResponse({ status: 200, description: 'Return ordered tasks.' })
  getOrderedTasks(@Param('projectId') projectId: string) {
    return this.tasksService.getOrderedTasks(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  @ApiResponse({ status: 200, description: 'Return the task.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER)
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task successfully updated.' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
