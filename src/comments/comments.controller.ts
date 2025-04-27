import { Controller, Post, Param, Req, Body, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';

@ApiTags('Comments')
@Controller('posts')
@ApiBearerAuth('JWT-auth')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

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
    return this.commentsService.createComment(postId, req.user.id, content);
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
    return this.commentsService.getComments(postId);
  }
}
