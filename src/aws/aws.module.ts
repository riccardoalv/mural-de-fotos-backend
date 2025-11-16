import { Module } from '@nestjs/common';
import { AwsUploadService } from './aws.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AwsUploadService],
  exports: [AwsUploadService],
})
export class AwsUploadModule {}
