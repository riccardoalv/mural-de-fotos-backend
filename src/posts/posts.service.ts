import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { CreatePostDto, CreatePostSchema } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma, Post } from '@prisma/client';
import { IMAGE_DIR } from 'src/main';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) { }

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Envie um arquivo válido');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'O arquivo enviado não é uma imagem válida',
      );
    }

    // Gera um nome único para o arquivo e define o caminho de salvamento
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    const filePath = path.join(IMAGE_DIR, filename);

    // Salva o arquivo no disco somente se ele for válido
    await fs.writeFile(filePath, file.buffer);

    // Atualiza o DTO com a URL da imagem (ou o caminho relativo, conforme o caso)
    createPostDto.imageUrl = `${IMAGE_DIR}/${filename}`;

    // Valida os dados do post e cria-o no banco de dados
    const parsed = CreatePostSchema.parse(createPostDto);
    const post = await this.prisma.post.create({
      data: {
        ...parsed,
        userId,
      },
    });
    return post;
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            avatarUrl: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {},
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    return post;
  }

  async findAll(query: any, isLogged: boolean) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.limit,
    });

    const queryResult = await paginate<Post[], Prisma.PostFindManyArgs>(
      this.prisma.post,
      {
        where: {
          ...(!isLogged ? { public: true } : {}),
        },
        include: {
          likes: true,
          user: {
            select: {
              id: true,
              avatarUrl: true,
              name: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    );

    return queryResult;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...updatePostDto,
      },
    });
    return post;
  }

  async removePost(id: string) {
    const post = await this.prisma.post.delete({
      where: { id },
    });
    return post;
  }

  async likePost(postId: string, userId: string) {
    return this.prisma.like.upsert({
      where: {
        userId_postId: { userId, postId },
      },
      update: {},
      create: { userId, postId },
    });
  }

  async unlikePost(postId: string, userId: string) {
    return this.prisma.like.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
  }

  async createComment(postId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: { content, postId, userId },
    });
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async liked(postId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    return like ? true : false;
  }
}
