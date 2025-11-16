import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { lookup as lookupMime } from 'mime-types';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { AwsUploadService } from 'src/aws/aws.service';

const LEGACY_IMAGE_DIR = 'uploads';

@Injectable()
export class AwsStartupMigrationService implements OnModuleInit {
  private readonly logger = new Logger(AwsStartupMigrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly awsUploadService: AwsUploadService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Iniciando migração de URLs de posts para S3...');
    await this.migratePostImagesToS3();
    this.logger.log('Migração de URLs de posts para S3 concluída.');
  }

  private async migratePostImagesToS3(): Promise<void> {
    const postsToMigrate = await this.prisma.post.findMany({
      where: {
        OR: [
          { imageUrl: { startsWith: '/' } },
          { imageUrl: { startsWith: LEGACY_IMAGE_DIR } },
        ],
      },
    });

    if (!postsToMigrate.length) {
      this.logger.log('Nenhum post com URL legada encontrado para migração.');
      return;
    }

    this.logger.log(`Encontrados ${postsToMigrate.length} posts para migrar.`);

    for (const post of postsToMigrate) {
      try {
        if (!post.imageUrl) continue;

        const relativePath = post.imageUrl.startsWith('/')
          ? post.imageUrl.slice(1)
          : post.imageUrl;

        const absolutePath = path.resolve(relativePath);

        const buffer = await fs.readFile(absolutePath);

        const mimeType =
          lookupMime(absolutePath) ||
          (post.isVideo ? 'video/mp4' : 'image/jpeg');

        const fileName = path.basename(relativePath);
        const folder = post.isVideo ? 'posts/videos' : 'posts/images';

        const { url } = await this.awsUploadService.uploadFile({
          buffer,
          fileName,
          mimeType: String(mimeType),
          folder,
        });

        await this.prisma.post.update({
          where: { id: post.id },
          data: {
            imageUrl: url,
          },
        });

        this.logger.log(`Post ${post.id} migrado para S3 com sucesso: ${url}`);
      } catch (error) {
        this.logger.error(
          `Erro ao migrar post ${post.id} (${post.imageUrl}): ${error.message}`,
        );
      }
    }
  }
}
