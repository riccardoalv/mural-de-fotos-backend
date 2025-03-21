import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => Number(val || 1))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'page deve ser um número positivo',
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => Number(val || 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'limit deve ser um número positivo',
    }),
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
