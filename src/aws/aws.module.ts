import { Module } from '@nestjs/common';
import { AwsUploadService } from './aws.service';
import { ConfigModule } from '@nestjs/config';
import { AwsController } from 'src/aws/aws.controller';
import { AwsStartupMigrationService } from 'src/aws/aws-startup.service';

@Module({
  imports: [ConfigModule],
  providers: [AwsUploadService, AwsStartupMigrationService],
  controllers: [AwsController],
  exports: [AwsUploadService],
})
export class AwsUploadModule {}
