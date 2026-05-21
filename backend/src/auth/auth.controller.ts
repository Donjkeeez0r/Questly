import { Body, Controller, Get, HttpCode, HttpStatus, Req, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface IRequestUser {
  user: {
    userId: string;
  };
}

@Controller('auth')
@ApiTags('Авторизация')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
  })
  @ApiResponse({
    status: 400,
    description: 'Пользователь с таким email уже существует',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизация пользователя.' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
  })
  @ApiResponse({
    status: 401,
    description: 'Ошибка авторизации: неверный email или пароль',
  })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя получены',
  })
  me(@Req() req: IRequestUser) {
    return this.authService.getMe(req.user.userId);
  }
}
