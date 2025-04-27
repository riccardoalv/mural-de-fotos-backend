import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  email: z.string(),
  code: z.string(),
  newPassword: z.string().min(6),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) { }
