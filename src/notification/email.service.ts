import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { Resend } from 'resend';
import { emailTemplate } from './templates/comment-notification-email.template';
import { passwordRecoveryTemplate } from './templates/password-recovery-email.template';
import { Comment, User } from '@prisma/client';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendCommentNotification(comment: Comment, post: any, users: User[]) {
    const html = await ejs.render(emailTemplate, { comment });

    const to = users.map((user) => user.email).filter(Boolean);

    return this.resend.emails.send({
      from: 'Mural de Fotos <noreply@mural.earthdoor.cc>',
      to,
      subject: `Um novo comentário foi adicionado no post: "${post.caption}"!`,
      html,
    });
  }

  async sendPasswordRecovery(email: string, resetPasswordCode: string) {
    const recoveryUrl = `${process.env.FRONTEND_URL}/reset-password?code=${resetPasswordCode}`;

    const html = await ejs.render(passwordRecoveryTemplate, { recoveryUrl });

    return this.resend.emails.send({
      from: 'Mural de Fotos <noreply@mural.earthdoor.cc>',
      to: email,
      subject: 'Recuperação de senha',
      html,
    });
  }
}
