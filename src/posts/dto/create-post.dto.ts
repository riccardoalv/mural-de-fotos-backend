import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreatePostSchema = z.object({
  caption: z.string().optional().describe('Legenda opcional do post'),
  imageUrl: z.string().describe('URL da imagem do post'),
  public: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .describe('Define se o post é público'),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) { }
