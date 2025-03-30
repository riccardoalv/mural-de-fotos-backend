import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { join } from 'path';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendCommentNotification(comment: any) {
    const templatePath = join(
      __dirname,
      'templates',
      'comment-notification-email.ejs',
    );

    const html = await ejs.renderFile(templatePath, { comment });

    return this.resend.emails.send({
      from: 'noreply@mural.earthdoor.cc',
      to: comment.post.user.email,
      subject: 'Você tem um novo comentário no seu post!',
      html,
    });
  }
}
