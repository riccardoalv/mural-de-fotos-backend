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
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) { }

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Envie um arquivo válido');
    }

    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'O arquivo enviado deve ser uma imagem ou vídeo válido',
      );
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    const directory = IMAGE_DIR;
    const filePath = path.join(directory, filename);

    await fs.writeFile(filePath, file.buffer);

    createPostDto.imageUrl = `${directory}/${filename}`;

    const parsed = CreatePostSchema.parse(createPostDto);
    const post = await this.prisma.post.create({
      data: {
        ...parsed,
        userId,
        isVideo,
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
    const {
      page,
      limit,
      userId,
      orderBy = 'createdAt',
      order = 'desc',
    } = query;

    const paginate = createPaginator({ page, perPage: limit });

    const orderByClause =
      orderBy === 'likes'
        ? { likes: { _count: order } }
        : orderBy === 'comments'
          ? { comments: { _count: order } }
          : { [orderBy]: order };

    const queryResult = await paginate<Post[], Prisma.PostFindManyArgs>(
      this.prisma.post,
      {
        where: {
          ...(userId ? { userId } : {}),
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
        orderBy: orderByClause,
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
    const comment = await this.prisma.comment.create({
      data: { content, postId, userId },
      include: {
        post: {
          include: {
            user: {
              omit: {
                cpf: true,
                password: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    this.eventEmitter.emit('comment.created', { comment, postId, userId });

    return comment;
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async liked(postId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    return like;
  }
}
