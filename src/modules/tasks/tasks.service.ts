import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskUpdateDto } from './dto/task-update.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: TaskCreateDto) {
    return this.prisma.task.create({
      data: { ...data, ownerId: userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({ where: { ownerId: userId } });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    void task; // ← unused-vars 回避（存在確認として使っているため必要）
    if (!task || task.ownerId !== userId) throw new NotFoundException();
    return task;
  }

  async update(userId: string, id: string, data: TaskUpdateDto) {
    const task = await this.findOne(userId, id);
    void task; // ← unused-vars 回避
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.task.delete({ where: { id } });
  }
}
