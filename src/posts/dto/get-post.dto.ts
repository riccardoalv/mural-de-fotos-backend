import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const GetPostSchema = z.object({
  id: z.string().uuid().describe('Identificador único do post'),
  caption: z.string().nullable().describe('Legenda do post'),
  imageUrl: z.string().url().describe('URL da imagem do post'),
  public: z
    .string()
    .transform((val) => val.toLowerCase() === 'true')
    .describe('Define se o post é público'),
  createdAt: z.date().describe('Data de criação do post'),
  updatedAt: z.date().describe('Data da última atualização do post'),
  userId: z
    .string()
    .uuid()
    .describe('Identificador do usuário que criou o post'),
});

export class GetPostDto extends createZodDto(GetPostSchema) { }
