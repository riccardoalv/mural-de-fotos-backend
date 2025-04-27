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
    private readonly eventEmitter: EventEmitter2,
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

    this.eventEmitter.emit('post.created', {
      ...post,
      caption: createPostDto.caption,
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

  async searchPosts(query: any, isLogged: boolean) {
    const { term, page = 1, limit = 10 } = query;

    if (!term?.trim())
      return { data: [], meta: { total: 0, page, perPage: limit } };

    const terms = term.toLowerCase().split(/\s+/).filter(Boolean);

    if (terms.length === 0)
      return { data: [], meta: { total: 0, page, perPage: limit } };

    const whereClauses = Prisma.join(
      terms.map((t) => Prisma.sql`LOWER(elem->>'label') LIKE ${'%' + t + '%'}`),
      ' AND ',
    );

    const publicCondition = isLogged
      ? Prisma.sql``
      : Prisma.sql`AND p."public" = true`;

    const offset = (page - 1) * limit;

    const posts = await this.prisma.$queryRaw<any[]>(Prisma.sql`
    SELECT p.*, 
           MAX((elem->>'score')::float) AS relevance
    FROM "Post" p,
         jsonb_array_elements(p."tags") AS elem
    WHERE ${whereClauses}
    ${publicCondition}
    GROUP BY p.id
    ORDER BY relevance DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

    const totalResult = await this.prisma.$queryRaw<
      { count: number }[]
    >(Prisma.sql`
    SELECT COUNT(DISTINCT p.id) AS count
    FROM "Post" p,
         jsonb_array_elements(p."tags") AS elem
    WHERE ${whereClauses}
    ${publicCondition}
  `);

    const total = totalResult?.[0]?.count ?? 0;

    return {
      data: posts,
      meta: {
        total,
        page,
        perPage: limit,
      },
    };
  }
}
