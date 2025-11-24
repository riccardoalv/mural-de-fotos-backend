import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LabelStartup } from 'src/labeling/label-startup.service';
import { LabelingController } from 'src/labeling/label.controller';
import { PostCreatedListener } from 'src/labeling/label.listener';
import { LabelingService } from 'src/labeling/label.service';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('POST_CREATED_WEBHOOK_URL'),
        timeout: 30 * 60 * 1000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [LabelingController],
  providers: [LabelingService, PostCreatedListener],
})
export class LabelingModule {}
