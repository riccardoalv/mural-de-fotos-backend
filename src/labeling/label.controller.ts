import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseArrayPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public-endpoint.decorator';
import { LabelingService } from 'src/labeling/label.service';

export class LabelEntityDto {
  @ApiPropertyOptional({
    description: 'Nome/label a ser atribuído',
    example: 'car',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'userId a ser atribuído',
    example: 'car',
  })
  userId?: string;
}

@ApiTags('Labeling')
@Public()
@Controller('labeling')
@ApiBearerAuth('JWT-auth')
export class LabelingController {
  constructor(private readonly labelingService: LabelingService) {}

  @Post('/label')
  @ApiOperation({
    summary: 'Rotula entidades (detecções) com o usuário informado',
    operationId: 'labelEntity',
  })
  @ApiQuery({
    name: 'entityId',
    description: 'ID(s) da(s) entidade(s) a ser(em) rotulada(s)',
    type: String,
    isArray: true,
    required: false,
  })
  @ApiQuery({
    name: 'clusterId',
    description: 'ID do cluster de entidades a ser rotulado',
    type: String,
    required: false,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário que está rotulando',
    type: String,
  })
  async label(
    @Query(
      'entityId',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    entityIds?: string[],
    @Query('clusterId') clusterId?: string,
    @Body() body?: LabelEntityDto,
  ) {
    return this.labelingService.label({
      userId: body?.userId,
      entityIds,
      clusterId,
      name: body?.name,
    });
  }

  @Get()
  @ApiOperation({
    summary:
      'Lista entities (detecções) com paginação e filtros (autenticado ou não)',
    operationId: 'listAllLabelingEntities',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite por página (default: 10)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filtrar por userId (ex: só rotuladas por tal usuário)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    description: 'Campo de ordenação (default: createdAt)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    description: 'Direção da ordenação: asc | desc (default: desc)',
  })
  @ApiQuery({
    name: 'alreadyClassified',
    required: false,
    type: Boolean,
    description: 'Já foi classificada? true | false',
  })
  async findAll(@Query() rawQuery: any) {
    const page = Number(rawQuery.page) || 1;
    const limit = Number(rawQuery.limit) || 10;

    let alreadyClassified: boolean | undefined = undefined;
    if (rawQuery.alreadyClassified !== undefined) {
      const value = String(rawQuery.alreadyClassified).toLowerCase();

      if (value === 'true' || value === '1') {
        alreadyClassified = true;
      } else if (value === 'false' || value === '0') {
        alreadyClassified = false;
      }
    }

    return this.labelingService.findAll({
      page,
      perPage: limit,
      userId: rawQuery.userId || undefined,
      orderBy: rawQuery.orderBy || 'createdAt',
      order: (rawQuery.order as 'asc' | 'desc') || 'desc',
      alreadyClassified,
    });
  }

  @Post('entity/:entityId/cluster/:clusterId')
  @ApiOperation({
    summary: 'Adiciona uma entidade a um cluster',
    operationId: 'addEntityOnCluster',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID da entidade a ser vinculada ao cluster',
    type: String,
  })
  @ApiParam({
    name: 'clusterId',
    description: 'ID do cluster',
    type: String,
  })
  async addEntityOnCluster(
    @Param('entityId') entityId: string,
    @Param('clusterId') clusterId: string,
  ) {
    return this.labelingService.addEntityOnCluster(entityId, clusterId);
  }

  @Delete('entity/:entityId/cluster')
  @ApiOperation({
    summary: 'Remove uma entidade do cluster associado',
    operationId: 'removeEntityFromCluster',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID da entidade a ser removida do cluster',
    type: String,
  })
  async removeEntityFromCluster(@Param('entityId') entityId: string) {
    return this.labelingService.removeEntityFromCluster(entityId);
  }
}
