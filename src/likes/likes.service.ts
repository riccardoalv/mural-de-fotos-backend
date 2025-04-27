import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) { }

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

  async liked(postId: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    return like;
  }
}
