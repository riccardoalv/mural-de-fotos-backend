import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { PostCreatedListener } from 'src/labeling/label.listener';

@Injectable()
export class LabelStartup implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly label: PostCreatedListener,
  ) {}

  async onModuleInit() {
    const medias = await this.prisma.media.findMany({
      where: {
        isProcessed: false,
        isVideo: false,
      },
    });

    for (const media of medias) {
      await this.label.processMedia(media);
    }
  }
}
