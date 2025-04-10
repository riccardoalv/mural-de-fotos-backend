import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';

@Injectable()
export class EmailListener {
  constructor(private readonly emailService: EmailService) { }

  @OnEvent('comment.created')
  async handleCommentCreatedEvent(payload: {
    comment: any;
    postId: string;
    userId: string;
  }) {
    const { comment } = payload;

    await this.emailService.sendCommentNotification(comment);
  }
}
