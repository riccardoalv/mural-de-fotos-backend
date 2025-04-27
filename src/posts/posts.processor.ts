import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/databases/prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';

interface HuggingFaceObjectDetection {
  score: number;
  label: string;
  box?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface HuggingFaceFaceDetection {
  score: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

@Injectable()
export class PostsProcessor {
  private readonly logger = new Logger(PostsProcessor.name);
  private readonly huggingfaceUrl =
    'https://api-inference.huggingface.co/models';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) { }

  @OnEvent('post.created')
  async handlePostCreated(event: {
    id: string;
    imageUrl: string;
    isVideo: boolean;
    caption?: string;
  }) {
    if (event.isVideo) {
      this.logger.log(`Skipping post ${event.id} because it is a video.`);
      return;
    }

    this.logger.log(`Processing image ${event.id}`);
    try {
      const imageBuffer = await this.loadImage(event.imageUrl);

      const [objectTags, faceDetections] = await Promise.all([
        this.detectObjects(imageBuffer),
        this.detectFaces(imageBuffer),
      ]);

      const captionTags = this.extractTagsFromCaption(event.caption);

      const allTags = [...captionTags, ...objectTags];

      await this.updatePostTags(event.id, allTags);
      await this.saveFaces(event.id, faceDetections);

      this.logger.log(
        `Processed Post ${event.id}: ${allTags.length} tags, ${faceDetections.length} faces`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process Post ${event.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async loadImage(imagePathRelative: string): Promise<Buffer> {
    const imagePath = path.resolve(imagePathRelative);
    return fs.readFile(imagePath);
  }

  private async detectObjects(
    imageBuffer: Buffer,
  ): Promise<{ label: string; score: number }[]> {
    const url = `${this.huggingfaceUrl}/facebook/detr-resnet-50`;
    const response$ = this.httpService.post<HuggingFaceObjectDetection[]>(
      url,
      imageBuffer,
      {
        headers: this.buildAuthHeaders(),
        timeout: 30_000,
      },
    );

    const { data } = await firstValueFrom(response$);

    const tags = data
      .filter((obj) => obj.score > 0.7)
      .map((obj) => ({
        label: obj.label.toLowerCase(),
        score: obj.score,
      }));

    return tags;
  }

  private async detectFaces(
    imageBuffer: Buffer,
  ): Promise<HuggingFaceFaceDetection[]> {
    const url = `${this.huggingfaceUrl}/valhalla/face-detection`;
    const response$ = this.httpService.post<HuggingFaceFaceDetection[]>(
      url,
      imageBuffer,
      {
        headers: this.buildAuthHeaders(),
        timeout: 30_000,
      },
    );

    const { data } = await firstValueFrom(response$);
    return data;
  }

  private async updatePostTags(
    postId: string,
    tags: { label: string; score: number }[],
  ) {
    await this.prisma.post.update({
      where: { id: postId },
      data: { tags },
    });
  }

  private async saveFaces(postId: string, faces: HuggingFaceFaceDetection[]) {
    const faceData = faces.map((face) => ({
      boundingBox: {
        x: face.box.x,
        y: face.box.y,
        width: face.box.width,
        height: face.box.height,
      },
      postId,
    }));

    if (faceData.length > 0) {
      await this.prisma.face.createMany({
        data: faceData,
      });
    }
  }

  private buildAuthHeaders() {
    const token = process.env.HUGGINGFACE_API_KEY;
    if (!token) throw new Error('Hugging Face API key not configured');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    };
  }

  private extractTagsFromCaption(
    caption?: string,
  ): { label: string; score: number }[] {
    if (!caption) return [];

    const words = caption
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 1);

    return Array.from(new Set(words)).map((word) => ({
      label: word,
      score: 1,
    }));
  }
}
