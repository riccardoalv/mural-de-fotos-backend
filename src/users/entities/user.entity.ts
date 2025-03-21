import { z } from 'zod';
import { isValidCPF } from 'src/shareds/helpers/isValidCpf';

export const UserSchema = z.object({
  id: z.string().uuid().describe('User ID'),
  email: z.string().email().describe('User Email'),
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(2)
    .describe('First Name'),
  cpf: z
    .string()
    .min(11)
    .max(11)
    .refine(isValidCPF, { message: 'Invalid CPF' })
    .describe('User CPF'),
  bio: z.string().optional(),

  createdAt: z.string().datetime().optional().describe('Date of Creation'),
  updatedAt: z.string().datetime().optional().describe('Date of Update'),
});

export const UserOrderType = Object.keys(UserSchema.omit({ id: true }).shape);
export type UserDtoType = z.infer<typeof UserSchema>;
