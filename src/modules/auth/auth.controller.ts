import {   
  Body,
  Controller,
  Post,
  UseGuards,
  Request 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from './jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: JwtPayload;
}

@ApiTags('auth')
@ApiBearerAuth()   // ←←🔥 Swagger が JWT を自動送信するようになる
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req: AuthRequest, @Body() dto: LogoutDto) {
    const payload = req.user;
    return this.authService.logout(payload, dto.refreshToken);
  }
}
