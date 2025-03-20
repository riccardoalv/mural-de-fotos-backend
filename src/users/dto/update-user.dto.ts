import { UserSchema } from '../entities/user.entity';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  cpf: true,
})
  .extend({
    password: z.string().min(6).optional().describe('User Password'),
  })
  .partial();

export class UpdateUserDto extends createZodDto(UpdateUserSchema) { }
