import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  MinLength,
  IsString,
  IsOptional,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}