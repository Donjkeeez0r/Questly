import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  Param,
  Get,
  Delete,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface IRequestUser {
  user: {
    userId: string;
  };
}

@Controller('quiz')
@ApiTags('Квизы')
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiOperation({ summary: 'Создать новый квиз. Только для CREATOR' })
  @ApiResponse({
    status: 500,
    description: 'Не удалось создать квиз',
  })
  @ApiResponse({
    status: 201,
    description: 'Квиз успешно создан',
  })
  createQuiz(@Body() createDto: CreateQuizDto, @Req() req: IRequestUser) {
    return this.quizService.createQuiz(createDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех квизов ' })
  findAll() {
    return this.quizService.findAll();
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отправить ответы на квиз ' })
  @ApiResponse({
    status: 201,
    description: 'Результаты сохранены',
  })
  @ApiResponse({
    status: 404,
    description: 'Квиз не найден',
  })
  submitQuiz(
    @Param('id') quizId: string,
    @Req() req: IRequestUser,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizService.submitQuiz(dto, quizId, req.user.userId);
  }

  @Get(':id/leaderboad')
  @ApiOperation({ summary: 'Получить таблицу лидеров для конкретного квиза ' })
  getLeaderboard(@Param('id') quizId: string) {
    return this.quizService.getLeaderboard(quizId);
  }

  @Get(':id/edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiOperation({
    summary: 'Получить квиз для редактирования. Только для автора ',
  })
  @ApiResponse({
    status: 200,
    description: 'Данные квиза для редактирования получены',
  })
  @ApiResponse({
    status: 404,
    description: 'Квиз не найден',
  })
  @ApiResponse({
    status: 403,
    description: 'Вы не можете редактировать чужой квиз',
  })
  getQuizForEdit(@Param('id') quizId: string, @Req() req: IRequestUser) {
    return this.quizService.getQuizForEdit(quizId, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiOperation({ summary: 'Удалить квиз. Только для автора ' })
  @ApiResponse({
    status: 200,
    description: 'Квиз успешно удален',
  })
  @ApiResponse({
    status: 404,
    description: 'Квиз не найден',
  })
  @ApiResponse({
    status: 403,
    description: 'Вы не можете удалить чужой квиз ',
  })
  deleteQuiz(@Param('id') quizId: string, @Req() req: IRequestUser) {
    return this.quizService.deleteQuiz(quizId, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiOperation({ summary: 'Обновить данные квиза. Только для автора ' })
  @ApiResponse({
    status: 200,
    description: 'Квиз успешно обновлен',
  })
  @ApiResponse({
    status: 404,
    description: 'Квиз не найден',
  })
  @ApiResponse({
    status: 403,
    description: 'Вы не можете обновить чужой квиз',
  })
  updateQuiz(
    @Param('id') quizId: string,
    @Req() req: IRequestUser,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizService.updateQuiz(quizId, req.user.userId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120000)
  @ApiOperation({ summary: 'Получить квиз для прохождения ' })
  @ApiResponse({
    status: 200,
    description: 'Данные квиза получены',
  })
  @ApiResponse({
    status: 404,
    description: 'Квиз не найден',
  })
  getQuiz(@Param('id') quizId: string) {
    return this.quizService.getQuizForPlay(quizId);
  }

  @Post(':id/achievements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  @ApiOperation({ summary: 'Добавить достижение к квизу. Только автор ' })
  @ApiResponse({
    status: 201,
    description: 'Достижение создано',
  })
  @ApiResponse({
    status: 404,
    description: 'Квиз не найден',
  })
  @ApiResponse({
    status: 403,
    description: 'Вы не можете изменять чужой квиз',
  })
  addAchievement(
    @Param('id') quizId: string,
    @Req() req: IRequestUser,
    @Body() dto: CreateAchievementDto,
  ) {
    return this.quizService.addAchievementToQuiz(quizId, req.user.userId, dto);
  }

  @Get('achievements/my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить список моих полученных достижений ' })
  @ApiResponse({
    status: 200,
    description: 'Массив достижений пользователя',
  })
  getMyAchievements(@Req() req: IRequestUser) {
    return this.quizService.getMyAchievements(req.user.userId);
  }

  @Get('attempts/:id/ai-feedback')
  @UseGuards(JwtAuthGuard)
  getAiFeedback(@Param('id') attemptId: string, @Req() req: IRequestUser) {
    return this.quizService.getAiFeedback(attemptId, req.user.userId);
  }
}
