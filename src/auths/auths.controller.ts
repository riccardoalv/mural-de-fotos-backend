import { Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public-endpoint.decorator';
import { LocalAuthGuard } from './guards/local-auth.guards';
import { LoginDto } from './dto/login-auth.dto';
import { AuthService } from './auths.service';
import { Request as AuthRequest } from 'express';
@ApiTags('auths')
@Controller('auths')
export class AuthsController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Log in with email, cpf or cnpj and password',
    operationId: 'login',
  })
  @ApiBody({ type: LoginDto, description: 'User credentials for login' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Returns a JWT access token and user information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid cpf, cnpj  or password.',
  })
  @ApiBody({ type: LoginDto })
  @HttpCode(200)
  async login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }
}
