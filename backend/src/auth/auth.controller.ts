import { Controller, Request, Post, UseGuards, Get, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('login')
    async login(@Body() body) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        // req.user contient ce que JwtStrategy a retourné (userId, email, role)
        // On va chercher les infos complètes en base de données
        const user = await this.usersService.findOne(req.user.userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // On retire le mot de passe avant de l'envoyer
        const { password, ...result } = user;
        return result;
    }
}
