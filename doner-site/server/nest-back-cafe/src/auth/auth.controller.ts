import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../users/dto/user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        console.log('GET PROFILE USER:', req.user);
        const { password, ...userData } = req.user;
        return userData;
    }

    @UseGuards(JwtAuthGuard)
    @Post('update') // Или Patch, но Post проще для фронта иногда. Сделаем Post для надежности или Patch
    async update(@Request() req, @Body() updateData: any) {
        return this.authService.updateProfile(req.user.id, updateData);
    }
}
