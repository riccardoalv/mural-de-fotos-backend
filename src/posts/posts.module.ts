import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EmailListener } from 'src/notification/email.listener';
import { EmailService } from 'src/notification/email.service';
import { PostsProcessor } from './posts.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [EventEmitterModule.forRoot(), HttpModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PrismaService,
    EmailListener,
    EmailService,
    PostsProcessor,
  ],
})
export class PostsModule { }
