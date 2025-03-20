import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z
    .string()
    .describe('User email, CPF, or CNPJ')
    .refine(
      (value) => {
        return (
          value.includes('@') || // Email
          value.length === 11 || // CPF
          value.length === 14 // CNPJ
        );
      },
      { message: 'Invalid identifier (must be email, CPF, or CNPJ)' },
    ),
  password: z.string().min(6).describe('User password'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
export type LoginDtoType = z.infer<typeof LoginSchema>;
