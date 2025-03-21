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
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { Public } from 'src/common/decorators/public-endpoint.decorator';
import * as fs from 'fs';
import {
  PaginationQueryDto,
  PaginationQuerySchema,
} from 'src/common/dtos/pagination.dto';

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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
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
    return this.postsService.createPost(req.user.id, createPostDto, file);
  }

  @Public()
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  async findAll(@Req() req, @Query() rawQuery: any) {
    const query: PaginationQueryDto = PaginationQuerySchema.parse(rawQuery);
    const isLogged = !!req.user;
    return this.postsService.findAll(query, isLogged);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um post específico por ID',
    operationId: 'updatePostById',
  })
  @ApiBody({
    type: UpdatePostDto,
    description: 'Campos para atualização do post',
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
  @ApiOperation({ summary: 'Faz o download da imagem de um post' })
  @ApiResponse({ status: 200, description: 'Imagem enviada com sucesso' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async getImage(@Param('postId') postId: string, @Res() res) {
    const post = await this.postsService.findOne(postId);

    if (!fs.existsSync(post.imageUrl)) {
      throw new NotFoundException('Imagem não encontrada');
    }

    res.sendFile(post.imageUrl);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Dá like em um post', operationId: 'likePost' })
  @ApiResponse({ status: 200, description: 'Like registrado' })
  async likePost(@Param('id') postId: string, @Req() req) {
    return this.postsService.likePost(postId, req.user.id);
  }

  @Delete(':id/like')
  @ApiOperation({
    summary: 'Remove o like de um post',
    operationId: 'unlikePost',
  })
  @ApiResponse({ status: 200, description: 'Like removido' })
  async unlikePost(@Param('id') postId: string, @Req() req) {
    return this.postsService.unlikePost(postId, req.user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Cria um comentário em um post' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Comentário criado' })
  async comment(
    @Param('id') postId: string,
    @Req() req,
    @Body('content') content: string,
  ) {
    return this.postsService.createComment(postId, req.user.id, content);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lista comentários de um post' })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentários',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }

  @Get(':postId/liked')
  @ApiOperation({ summary: 'Verifica se o usuario deu like' })
  async liked(@Param('postId') postId: string, @Req() req) {
    return this.postsService.liked(postId, req.user.id);
  }
}
