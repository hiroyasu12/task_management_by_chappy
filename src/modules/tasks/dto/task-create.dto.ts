import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class TaskCreateDto {
  @ApiProperty({ example: 'Buy groceries' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Milk, bread, eggs', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'todo',
    required: false,
    enum: ['todo', 'in-progress', 'done'],
  })
  @IsOptional()
  @IsIn(['todo', 'in-progress', 'done'])
  status?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
