import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { comparePasswords } from 'src/utils/crypto-system';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(identifier: string, password: string) {
    let user;

    user = await this.usersService.findByEmail(identifier);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validar a senha
    const compare = comparePasswords(password, user.password);
    if (!compare) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { ...result } = user;
    delete result.password;
    return {
      ...result,
      userId: user.id,
    };
  }

  async login(user: Request['user']) {
    const payload = {
      email: user?.email,
      sub: user?.id,
    };

    const response = {
      accessToken: this.jwtService.sign(payload),
      ...payload,
    };

    return response;
  }
}
