import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { Comment, Post } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma/prisma.service';

@Injectable()
export class EmailListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) { }

  @OnEvent('comment.created')
  async handleCommentCreatedEvent(payload: {
    comment: Comment;
    postId: string;
    userId: string;
  }) {
    const { comment } = payload;

    const post = await this.prisma.post.findUnique({
      where: {
        id: payload.postId,
      },
      include: {
        comments: {
          include: {
            user: true,
          },
        },
      },
    });

    const comments = post!.comments;

    const users = comments.map((c) => c.user);

    await this.emailService.sendCommentNotification(
      comment,
      post as Post,
      users,
    );
  }
}
