import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailListener } from 'src/notification/email.listener';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [PostsController],
  providers: [PostsService, PrismaService, EmailListener],
})
export class PostsModule { }
