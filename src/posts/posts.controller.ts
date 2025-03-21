import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  getSchemaPath,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { Public } from 'src/common/decorators/public-endpoint.decorator';
import * as fs from 'fs';
import { IMAGE_DIR } from 'src/main';
import { diskStorage } from 'multer';

@ApiTags('Posts')
@Controller('posts')
@ApiBearerAuth('JWT-auth')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Post()
  @ApiOperation({
    summary: 'Cria um novo post com upload de imagem',
    operationId: 'createPost',
  })
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: IMAGE_DIR,
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = file.originalname.split('.').pop();
          const filename = `${uniqueSuffix}.${fileExtension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados para criação do post',
    schema: {
      type: 'object',
      properties: {
        caption: { type: 'string' },
        public: { type: 'boolean' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Post criado com sucesso',
    type: GetPostDto,
  })
  @ApiResponse({ status: 400, description: 'Dados da requisição inválidos' })
  async create(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    if (!file) {
      throw new BadRequestException('Send a valid file');
    }
    createPostDto.imageUrl = `${IMAGE_DIR}/${file.filename}`;
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retorna um post específico por ID',
    operationId: 'getPostById',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do post',
    type: GetPostDto,
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    return post;
  }

  @Get()
  @Public()
  @ApiOperation({
    summary:
      'Lista todos os posts com paginação (filtra entre autenticados e não autenticados)',
    operationId: 'listAllPosts',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de posts',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(GetPostDto) },
        },
        meta: {
          type: 'object',
          properties: {
            totalItems: { type: 'number' },
            itemCount: { type: 'number' },
            itemsPerPage: { type: 'number' },
            totalPages: { type: 'number' },
            currentPage: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Req() req, @Query() query: any) {
    const isLogged = !!req.user;
    return this.postsService.findAll(query, isLogged);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um post específico por ID',
    operationId: 'updatePostById',
  })
  @ApiResponse({
    status: 200,
    description: 'Post atualizado com sucesso',
    type: GetPostDto,
  })
  @ApiResponse({ status: 400, description: 'Dados da requisição inválidos' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove um post específico por ID',
    operationId: 'deletePostById',
  })
  @ApiResponse({
    status: 200,
    description: 'Post removido com sucesso',
    type: GetPostDto,
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async remove(@Param('id') id: string) {
    return this.postsService.removePost(id);
  }

  @Get(':postId/download-image')
  @Public()
  async getImage(@Param('postId') postId: string, @Res() res) {
    const post = await this.postsService.findOne(postId);

    if (!fs.existsSync(post.imageUrl)) {
      throw new NotFoundException('Imagem não encontrada');
    }

    res.sendFile(post.imageUrl);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Dá like em um post' })
  async likePost(@Param('id') postId: string, @Req() req) {
    return this.postsService.likePost(postId, req.user.id);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Remove o like de um post' })
  async unlikePost(@Param('id') postId: string, @Req() req) {
    return this.postsService.unlikePost(postId, req.user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Cria um comentário em um post' })
  async comment(
    @Param('id') postId: string,
    @Req() req,
    @Body('content') content: string,
  ) {
    return this.postsService.createComment(postId, req.user.id, content);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lista comentários de um post' })
  async getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }
}
