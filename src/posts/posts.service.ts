import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { CreatePostDto, CreatePostSchema } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma, Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) { }

  async createPost(userId: string, createPostDto: CreatePostDto) {
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
}
