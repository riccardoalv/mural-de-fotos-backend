import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { Resend } from 'resend';
import { emailTemplate } from './templates/comment-notification-email.template';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendCommentNotification(comment: any) {
    const html = await ejs.render(emailTemplate, { comment });

    return this.resend.emails.send({
      from: 'noreply@mural.earthdoor.cc',
      to: comment.post.user.email,
      subject: 'Você tem um novo comentário no seu post!',
      html,
    });
  }
}
