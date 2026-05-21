import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  Icon?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  scoreRequired!: number;
}
