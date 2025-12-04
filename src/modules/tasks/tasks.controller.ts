import { Controller, Post, Body, UseGuards, Get, Param, Put, Delete, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService) {}

  // For demo: using Request.user populated by JwtStrategy
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.tasks.create(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req: any) {
    return this.tasks.findAll(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.tasks.findOne(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.tasks.update(req.user.userId, id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tasks.remove(req.user.userId, id);
  }
}
