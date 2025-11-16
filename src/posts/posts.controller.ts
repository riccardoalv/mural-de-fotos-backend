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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
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
import { SearchPostsSchema } from './dto/search-posts.dto';

@ApiTags('Posts')
@Controller('posts')
@ApiBearerAuth('JWT-auth')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
      'Lista todos os posts com paginação e filtros (autenticado ou não)',
    operationId: 'listAllPosts',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite por página',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filtrar por ID do usuário',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['createdAt', 'likes', 'comments'],
    description: 'Campo de ordenação',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Direção da ordenação',
  })
  async findAll(@Req() req, @Query() rawQuery: any) {
    const query: any = {
      page: Number(rawQuery.page) || 1,
      limit: Number(rawQuery.limit) || 10,
      userId: rawQuery.userId || undefined,
      orderBy: rawQuery.orderBy || 'createdAt',
      order: rawQuery.order || 'desc',
    };

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

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Busca posts usando tags extraídas da imagem e do caption',
    operationId: 'searchPostsByTags',
  })
  @ApiQuery({
    name: 'term',
    required: true,
    type: String,
    description: 'Termo de busca para procurar nos posts',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados por página (default 10)',
  })
  async searchPosts(@Req() req, @Query() rawQuery: any) {
    const parsed = SearchPostsSchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    const isLogged = !!req.user;
    return this.postsService.searchPosts(parsed.data, isLogged);
  }
}
