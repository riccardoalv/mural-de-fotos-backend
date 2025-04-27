import { z } from 'zod';

export const SearchPostsSchema = z.object({
  term: z.string().min(1, { message: 'Termo de busca é obrigatório' }),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type SearchPostsDto = z.infer<typeof SearchPostsSchema>;
