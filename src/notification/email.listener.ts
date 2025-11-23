import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from 'src/databases/prisma/prisma.service';

@Injectable()
export class EmailListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

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

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    const users = comments.map((c) => c.user);

    users.push(user!);

    await this.emailService.sendCommentNotification(comment, post, users);
  }

  @OnEvent('password.reset')
  async handlePasswordResetEvent(payload: {
    email: string;
    resetPasswordCode: string;
  }) {
    const { email, resetPasswordCode } = payload;

    await this.emailService.sendPasswordRecovery(email, resetPasswordCode);
  }

  @OnEvent('face.detected')
  async handleFaceDetected(
    entity: Prisma.EntityGetPayload<{
      include: {
        media: { include: { post: { include: { user: true } } } };
        EntityCluster: { include: { user: true } };
      };
    }>,
  ) {
    const userEmail = entity.EntityCluster!.user!.email;
    const user = entity.media.post.user;
    const post = entity.media.post;
    const media = entity.media;
    await this.emailService.sendFaceDetected(userEmail, post, user, media);
  }
}
