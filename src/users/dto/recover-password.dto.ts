import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RecoverPasswordSchema = z.object({
  email: z.string().email(),
});

export class RecoverPasswordDto extends createZodDto(RecoverPasswordSchema) { }
