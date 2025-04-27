import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { Resend } from 'resend';
import { emailTemplate } from './templates/comment-notification-email.template';
import { Comment, Post, User } from '@prisma/client';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendCommentNotification(comment: Comment, post: Post, users: User[]) {
    const html = await ejs.render(emailTemplate, { comment });

    const to = users.map((user) => user.email).filter(Boolean);

    return this.resend.emails.send({
      from: 'Mural de Fotos <noreply@mural.earthdoor.cc>',
      to,
      subject: `Um novo comentário foi adicionado no post: "${post.caption}"!`,
      html,
    });
  }
}
