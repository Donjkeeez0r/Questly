import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class QuizService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async createQuiz(dto: CreateQuizDto, authorId: string) {
    try {
      const quiz = await this.prismaService.quiz.create({
        data: {
          title: dto.title,
          description: dto.description,
          difficulty: dto.difficulty,
          timeLimit: dto.timeLimit,
          creatorId: authorId,
          questions: {
            create: dto.questions.map((question) => {
              return {
                text: question.text,
                hint: question.hint,
                options: {
                  create: question.options.map((option) => {
                    return {
                      text: option.text,
                      isCorrect: option.isCorrect,
                    };
                  }),
                },
              };
            }),
          },
        },
        include: {
          questions: { include: { options: true } },
        },
      });

      return quiz;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Не удалось создать квиз!');
    }
  }

  async submitQuiz(dto: SubmitQuizDto, quizId: string, userId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: { include: { options: true } },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    let correctAnswersCount = 0;

    const userAnswersData: {
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
    }[] = [];

    for (const question of quiz.questions) {
      const userAnswer = dto.answers.find(
        (answer) => answer.questionId === question.id,
      );

      const correctOption = question.options.find((option) => option.isCorrect);

      let isCorrect = false;

      if (userAnswer && userAnswer.selectedOptionId === correctOption?.id) {
        isCorrect = true;
        correctAnswersCount++;
      }

      userAnswersData.push({
        questionId: question.id,
        selectedOptionId: userAnswer?.selectedOptionId || null,
        isCorrect,
      });
    }

    const score = Math.round(
      (correctAnswersCount / quiz.questions.length) * 100,
    );

    const attempt = await this.prismaService.quizAttempt.create({
      data: {
        score,
        userId,
        quizId,
        answers: { create: userAnswersData },
      },
    });

    const earnedAchievements: {
      id: string;
      name: string;
      description: string;
      Icon: string | null;
      scoreRequired: number;
      quizId: string;
    }[] = [];

    const quizAchievements = await this.prismaService.achievement.findMany({
      where: { quizId },
    });

    for (const achievement of quizAchievements) {
      if (score >= achievement.scoreRequired) {
        try {
          await this.prismaService.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
            },
          });

          earnedAchievements.push(achievement);
        } catch (error) {
          console.error(error);
        }
      }
    }

    return {
      message: 'Квиз завершен!',
      score: attempt.score,
      correctCount: correctAnswersCount,
      totalQuestions: quiz.questions.length,
      attemptId: attempt.id,
      newAchievements: earnedAchievements,
    };
  }

  async getLeaderboard(quizId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    const topAttempts = await this.prismaService.quizAttempt.findMany({
      where: { quizId: quizId },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take: 10,
      include: { user: { select: { id: true, email: true } } },
    });

    return topAttempts;
  }

  async deleteQuiz(quizId: string, userId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    if (quiz.creatorId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужой квиз!');
    }

    await this.prismaService.quiz.delete({ where: { id: quizId } });

    return {
      message: 'Квиз успешно удален!',
    };
  }

  async updateQuiz(quizId: string, userId: string, dto: UpdateQuizDto) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    if (quiz.creatorId !== userId) {
      throw new ForbiddenException('Вы не можете обновить чужой квиз!');
    }

    // Metadata-only update should not mutate questions to avoid breaking
    // historical attempts linked to existing questions/options.
    const questions = dto.questions;

    // Если пытаются изменить вопросы, но у квиза уже есть попытки — запрещаем.
    if (questions) {
      const attemptsCount = await this.prismaService.quizAttempt.count({
        where: { quizId },
      });

      if (attemptsCount > 0) {
        throw new BadRequestException(
          'Нельзя редактировать вопросы: у квиза уже есть попытки прохождения. Удалите попытки или создайте новый квиз.',
        );
      }
    }

    if (!questions) {
      return this.prismaService.quiz.update({
        where: { id: quizId },
        data: {
          title: dto.title,
          description: dto.description,
          difficulty: dto.difficulty,
          timeLimit: dto.timeLimit,
        },
        include: { questions: { include: { options: true } } },
      });
    }

    return this.prismaService.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { quizId: quizId } });

      return tx.quiz.update({
        where: { id: quizId },
        data: {
          title: dto.title,
          description: dto.description,
          difficulty: dto.difficulty,
          timeLimit: dto.timeLimit,
          questions: {
            create: questions.map((question) => {
              return {
                text: question.text,
                hint: question.hint,
                options: {
                  create: question.options.map((option) => {
                    return {
                      text: option.text,
                      isCorrect: option.isCorrect,
                    };
                  }),
                },
              };
            }),
          },
        },
        include: { questions: { include: { options: true } } },
      });
    });
  }

  findAll() {
    return this.prismaService.quiz.findMany();
  }

  async getQuizForEdit(quizId: string, userId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    if (quiz.creatorId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужой квиз!');
    }

    const attemptsCount = await this.prismaService.quizAttempt.count({
      where: { quizId },
    });

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        text: question.text,
        hint: question.hint,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      })),
      attemptsCount,
    };
  }

  async getQuizForPlay(quizId: string) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } }, achievements: true },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    const attemptsCount = await this.prismaService.quizAttempt.count({
      where: { quizId },
    });

    const secureQuiz = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((question) => {
        return {
          id: question.id,
          text: question.text,
          hint: question.hint,
          options: question.options.map((option) => {
            return {
              id: option.id,
              text: option.text,
            };
          }),
        };
      }),
      attemptsCount,
      achievements: quiz.achievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        Icon: a.Icon,
        scoreRequired: a.scoreRequired,
        quizId: a.quizId,
      })),
    };

    return secureQuiz;
  }

  async addAchievementToQuiz(
    quizId: string,
    userId: string,
    dto: CreateAchievementDto,
  ) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Квиз не найден!');
    }

    if (quiz.creatorId !== userId) {
      throw new ForbiddenException('Вы не можете изменять чужой квиз!');
    }

    return this.prismaService.achievement.create({ data: { ...dto, quizId } });
  }

  async getMyAchievements(userId: string) {
    return this.prismaService.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAiFeedback(attemptId: string, userId: string) {
    const attempt = await this.prismaService.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: true,
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Попытка не найдена!');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('Это не ваш результат!');
    }

    const wrongAnswers = attempt.answers.filter((answer) => !answer.isCorrect);

    if (wrongAnswers.length === 0) {
      return {
        feedback: 'Молодец! Идеальная работа!',
      };
    }

    let prompt = `Ты строгий, но дружелюбный ментор. Проанализируй ошибки студента в квизе "${attempt.quiz.title}".\n\n`;

    wrongAnswers.forEach((wa, index) => {
      const selected = wa.selectedOption?.text || 'Пропустил вопрос';
      prompt += `${index + 1}. Вопрос: "${wa.question.text}"\n`;
      prompt += `Студент ответил: "${selected}" (это неверно)\n\n`;
    });

    prompt += `Напиши короткий разбор (максимум 3-4 предложения). Объясни, в чем суть ошибок и какую тему нужно повторить. Не пиши готовые правильные ответы, дай направление для размышлений. Обращайся на "ты".`;

    const genAi = new GoogleGenerativeAI(
      this.configService.getOrThrow('GEMINI_API_KEY'),
    );

    const model = genAi.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    try {
      const result = await model.generateContent(prompt);

      return {
        feedback: result.response.text(),
        wrongAnswersCount: wrongAnswers.length,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'ИИ сейчас недоступен, попробуйте позже!',
      );
    }
  }
}
