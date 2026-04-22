import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Некорректный email' })
    email: string;

    @IsNotEmpty({ message: 'Пароль не может быть пустым' })
    @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
    password: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Некорректный email' })
    email: string;

    @IsNotEmpty({ message: 'Пароль не может быть пустым' })
    password: string;
}
