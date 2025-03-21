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
import { join } from 'path';
import * as fs from 'fs';

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
  @UseInterceptors(FileInterceptor('image', { dest: './images' }))
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
    createPostDto.imageUrl = `./images/${file.filename}`;
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  @Post('/bulk')
  @ApiOperation({
    summary: 'Cria múltiplos posts com upload de múltiplas imagens',
    operationId: 'createMultiplePosts',
  })
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 10, { dest: './images' }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Dados para criação de múltiplos posts. O campo "posts" deve ser um JSON contendo um array de objetos com os campos "caption" e "public". Os posts serão criados na mesma ordem dos arquivos enviados em "images".',
    schema: {
      type: 'object',
      properties: {
        posts: {
          type: 'string',
          description:
            'JSON contendo um array de dados dos posts. Exemplo: [{"caption": "Legenda 1", "public": true}, {"caption": "Legenda 2", "public": false}]',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['posts', 'images'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Posts criados com sucesso',
    isArray: true,
    type: GetPostDto,
  })
  async createMultiple(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    let postsData;
    try {
      postsData = JSON.parse(body.posts);
    } catch (error) {
      throw new BadRequestException(
        'Formato inválido para o campo posts. Deve ser um JSON válido.',
      );
    }

    if (!Array.isArray(postsData)) {
      throw new BadRequestException('O campo posts deve ser um array.');
    }

    if (postsData.length !== files.length) {
      throw new BadRequestException(
        'O número de posts deve ser igual ao número de imagens enviadas.',
      );
    }

    const createdPosts: GetPostDto[] = [];
    for (let i = 0; i < files.length; i++) {
      postsData[i].imageUrl = `./images/${files[i].filename}`;
      const createdPost = await this.postsService.createPost(
        req.user.id,
        postsData[i],
      );
      createdPosts.push(createdPost);
    }
    return createdPosts;
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

  @Get(':filename')
  @Public()
  async getImage(@Param('filename') filename: string, @Res() res) {
    const filePath = join(__dirname, '..', '..', 'images', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Imagem não encontrada');
    }
    res.sendFile(filePath);
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
