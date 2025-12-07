import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { TaskCreateDto } from './dto/task-create.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from './../auth/jwt-payload.interface';

interface AuthRequest extends ExpressRequest {
  user: JwtPayload;
}

@ApiTags('tasks')
@ApiBearerAuth()   // ←←🔥 Swagger が JWT を自動送信するようになる
@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: AuthRequest, @Body() dto: TaskCreateDto) {
    return this.tasks.create(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.tasks.findAll(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.tasks.findOne(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Request() req: AuthRequest, @Param('id') id: string, @Body() dto: TaskUpdateDto) {
    return this.tasks.update(req.user.userId, id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.tasks.remove(req.user.userId, id);
  }
}
