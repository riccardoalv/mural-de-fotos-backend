import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetUserSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the user'),
  email: z.string().email().nullable().describe('Email address of the user'),
  name: z.string().describe('Name of the user'),
  cpf: z.string().nullable().describe('CPF of the user'),

  createdAt: z.date().describe('Date when the user was created'),
  updatedAt: z.date().describe('Date when the user was last updated'),
});

export class GetUserDto extends createZodDto(GetUserSchema) { }
