import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { Resend } from 'resend';
import { emailTemplate } from './templates/comment-notification-email.template';
import { passwordRecoveryTemplate } from './templates/password-recovery-email.template';
import { Comment, User, Post, Media } from '@prisma/client';
import { photoTagTemplate } from './templates/face-detected-email.template';

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
    const html = await ejs.render(passwordRecoveryTemplate, {
      resetPasswordCode,
    });

    return this.resend.emails.send({
      from: 'Mural de Fotos <noreply@mural.earthdoor.cc>',
      to: email,
      subject: 'Recuperação de senha',
      html,
    });
  }

  async sendFaceDetected(email: string, post: Post, user: User, media: Media) {
    const html = await ejs.render(photoTagTemplate, {
      post,
      user,
      media,
    });

    return this.resend.emails.send({
      from: 'Mural de Fotos <noreply@mural.earthdoor.cc>',
      to: email,
      subject: 'Você apareceu em uma nova foto',
      html,
    });
  }
}
