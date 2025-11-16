import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AwsUploadService } from 'src/aws/aws.service';

@ApiTags('AWS')
@Controller('upload')
@ApiBearerAuth('JWT-auth')
export class AwsController {
  constructor(private readonly aws: AwsUploadService) {}

  @Post()
  @ApiOperation({
    summary: 'Faz upload de uma imagem para o S3 e retorna a URL pública',
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo de imagem a ser enviado',
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        folder: {
          type: 'string',
          description:
            'Pasta opcional dentro do bucket onde o arquivo será salvo (ex: "avatars", "posts")',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Chave do arquivo no bucket' },
        url: { type: 'string', description: 'URL pública do arquivo' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados da requisição inválidos' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado (campo "image").');
    }

    return this.aws.uploadFile({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      folder,
    });
  }
}
