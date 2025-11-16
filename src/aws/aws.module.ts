import { Module } from '@nestjs/common';
import { AwsUploadService } from './aws.service';

@Module({
  imports: [],
  providers: [AwsUploadService],
  exports: [AwsUploadService],
})
export class AwsUploadModule {}
