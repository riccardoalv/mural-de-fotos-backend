import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { PrismaModule } from 'src/databases/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule { }
