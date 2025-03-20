import { createZodDto } from 'nestjs-zod';
import { UserSchema } from '../entities/user.entity';
import { z } from 'zod';

export const CreateUserSchema = UserSchema.pick({
  cpf: true,
  email: true,
  name: true,
  bio: true,
}).extend({
  password: z.string().min(6).optional().describe('User Password'),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) { }
