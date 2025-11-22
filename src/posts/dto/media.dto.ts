import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MediaSchema = z.object({
  id: z.string().uuid().describe('Identificador único do media'),
  order: z.number().describe('Ordem do media dentro do post'),
  imageUrl: z.string().url().describe('URL da imagem/vídeo do media'),
  isVideo: z.boolean().describe('Indica se o media é um vídeo'),
  createdAt: z.date().describe('Data de criação do media'),
  updatedAt: z.date().describe('Data da última atualização do media'),
  tags: z.any().nullable().optional().describe('Tags em JSON do media'),
});

export class MediaDto extends createZodDto(MediaSchema) {}
