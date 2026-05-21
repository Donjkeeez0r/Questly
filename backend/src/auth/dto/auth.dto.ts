import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsEmail({}, { message: 'Некорректный email! ' })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto extends AuthDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
