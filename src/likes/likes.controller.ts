import { Controller, Delete, Param, Post, Req, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';

@ApiTags('Likes')
@Controller('posts')
@ApiBearerAuth('JWT-auth')
export class LikesController {
  constructor(private readonly likesService: LikesService) { }

  @Post(':id/like')
  @ApiOperation({ summary: 'Dá like em um post', operationId: 'likePost' })
  @ApiResponse({ status: 200, description: 'Like registrado' })
  async likePost(@Param('id') postId: string, @Req() req) {
    return this.likesService.likePost(postId, req.user.id);
  }

  @Delete(':id/like')
  @ApiOperation({
    summary: 'Remove o like de um post',
    operationId: 'unlikePost',
  })
  @ApiResponse({ status: 200, description: 'Like removido' })
  async unlikePost(@Param('id') postId: string, @Req() req) {
    return this.likesService.unlikePost(postId, req.user.id);
  }

  @Get(':postId/liked')
  @ApiOperation({ summary: 'Verifica se o usuário deu like' })
  @ApiResponse({ status: 200, description: 'Status do like' })
  async liked(@Param('postId') postId: string, @Req() req) {
    return this.likesService.liked(postId, req.user.id);
  }
}
