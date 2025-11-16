import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { lookup as lookupMime } from 'mime-types';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { AwsUploadService } from 'src/aws/aws.service';

const LEGACY_IMAGE_DIR = 'uploads';

@Injectable()
export class AwsStartupMigrationService {
  private readonly logger = new Logger(AwsStartupMigrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly awsUploadService: AwsUploadService,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Iniciando migrações de imagens legadas para S3...');

    await this.migratePostImagesToS3();
    await this.migrateUserAvatarsToS3();

    this.logger.log('Migrações de imagens legadas para S3 concluídas.');
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
      this.logger.log(
        'Nenhum post com URL de imagem legada encontrado para migração.',
      );
      return;
    }

    this.logger.log(`Encontrados ${postsToMigrate.length} posts para migrar.`);

    for (const post of postsToMigrate) {
      try {
        if (!post.imageUrl) continue;

        const absolutePath = path.resolve(post.imageUrl);

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
      } catch (error: any) {
        this.logger.error(
          `Erro ao migrar post ${post.id} (${post.imageUrl}): ${error.message}`,
        );
      }
    }
  }

  private async migrateUserAvatarsToS3(): Promise<void> {
    const usersToMigrate = await this.prisma.user.findMany({
      where: {
        avatarUrl: {
          not: null,
        },
        AND: [
          {
            OR: [
              { avatarUrl: { startsWith: '/' } },
              { avatarUrl: { startsWith: LEGACY_IMAGE_DIR } },
            ],
          },
        ],
      },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    if (!usersToMigrate.length) {
      this.logger.log(
        'Nenhum usuário com avatarUrl legado encontrado para migração.',
      );
      return;
    }

    this.logger.log(
      `Encontrados ${usersToMigrate.length} usuários com avatar legado para migrar.`,
    );

    for (const user of usersToMigrate) {
      try {
        if (!user.avatarUrl) continue;

        const relativePath = user.avatarUrl.startsWith('/')
          ? user.avatarUrl.slice(1)
          : user.avatarUrl;

        const absolutePath = path.resolve(relativePath);

        const buffer = await fs.readFile(absolutePath);

        const mimeType = lookupMime(absolutePath) || 'image/jpeg';

        const fileName = path.basename(relativePath);
        const folder = 'avatars';

        const { url } = await this.awsUploadService.uploadFile({
          buffer,
          fileName,
          mimeType: String(mimeType),
          folder,
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            avatarUrl: url,
          },
        });

        this.logger.log(
          `Avatar do usuário ${user.id} migrado para S3 com sucesso: ${url}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Erro ao migrar avatar do usuário ${user.id} (${user.avatarUrl}): ${error.message}`,
        );
      }
    }
  }
}
