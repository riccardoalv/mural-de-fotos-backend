import { Module } from '@nestjs/common';
import { AwsUploadService } from './aws.service';
import { ConfigModule } from '@nestjs/config';
import { AwsController } from 'src/aws/aws.controller';

@Module({
  imports: [ConfigModule],
  providers: [AwsUploadService],
  controllers: [AwsController],
  exports: [AwsUploadService],
})
export class AwsUploadModule {}
