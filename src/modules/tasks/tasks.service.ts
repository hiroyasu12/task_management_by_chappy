import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.task.create({
      data: { ...data, ownerId: userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({ where: { ownerId: userId } });
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task || task.ownerId !== userId) throw new NotFoundException();
    return task;
  }

  async update(userId: string, id: string, data: any) {
    const task = await this.findOne(userId, id);
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.task.delete({ where: { id } });
  }
}
