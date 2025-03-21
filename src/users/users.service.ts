import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserSchema } from './dto/create-user.dto';
import { UpdateUserSchema } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/databases/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async createUser(createUserDto: CreateUserDto) {
    const parsedDto = CreateUserSchema.parse(createUserDto);
    const hashedPassword = await bcrypt.hash(parsedDto.password, 10);

    const checkEmailAndCpf = await this.prisma.user.findMany({
      where: {
        OR: [{ email: parsedDto.email, cpf: parsedDto.cpf }],
      },
    });

    if (checkEmailAndCpf.length > 0) {
      throw new ConflictException('Email or CPF already in use');
    }

    const user = await this.prisma.user.create({
      data: {
        ...parsedDto,
        password: hashedPassword,
        email: parsedDto.email,
      },
      omit: {
        password: true,
      },
    });

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: {
        cpf: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const parsedDto = UpdateUserSchema.parse(updateUserDto);

    if (parsedDto.password) {
      parsedDto.password = await bcrypt.hash(parsedDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...parsedDto,
      },
      omit: {
        cpf: true,
        password: true,
      },
    });
    return user;
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
