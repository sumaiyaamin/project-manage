import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      owner: { id: createProjectDto.ownerId },
      members: createProjectDto.memberIds?.map((id) => ({ id })),
    });

    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['owner', 'members', 'tasks'],
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);

    if (updateProjectDto.memberIds) {
      project.members = updateProjectDto.memberIds.map((id) => ({ id }) as any);
    }

    const updatedProject = Object.assign(project, {
      ...updateProjectDto,
      owner: updateProjectDto.ownerId
        ? { id: updateProjectDto.ownerId }
        : project.owner,
    });

    return this.projectRepository.save(updatedProject);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.softRemove(project);
  }

  async findUserProjects(userId: string): Promise<Project[]> {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.members', 'members')
      .where('owner.id = :userId', { userId })
      .orWhere('members.id = :userId', { userId })
      .getMany();
  }
}
