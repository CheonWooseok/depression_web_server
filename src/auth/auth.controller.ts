import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('')
  async login(@Body() body: any) {
    const auth = await this.authService.authenticate(
      body.user_id,
      body.password,
    );

    return auth;
  }
}
