import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { PrismaService } from 'src/databases/prisma/prisma.service';

export interface LabelEntitiesInput {
  entityIds?: string[];
  clusterId?: string;
  userId?: string;
  name?: string;
}

@Injectable()
export class LabelingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page: number;
    perPage: number;
    userId?: string;
    orderBy: string;
    order: 'asc' | 'desc';
    alreadyClassified?: boolean;
  }) {
    const { page, perPage, userId, orderBy, order, alreadyClassified } = params;

    const paginate = createPaginator({ perPage });

    const where: Prisma.EntityClusterWhereInput = {};

    if (userId) {
      where.userId = userId;
    } else if (alreadyClassified === true) {
      where.userId = { not: null };
    } else if (alreadyClassified === false) {
      where.userId = null;
    }

    return paginate<any, Prisma.EntityClusterFindManyArgs>(
      this.prisma.entityCluster,
      {
        where,
        orderBy: {
          [orderBy]: order,
        } as Prisma.EntityOrderByWithRelationInput,
        include: {
          entities: { include: { media: true } },
          user: { select: { email: true, name: true, avatarUrl: true } },
        },
      },
      { page },
    );
  }

  async label(input: LabelEntitiesInput) {
    const { clusterId, userId, name } = input;

    const cluster = await this.prisma.entityCluster.findUnique({
      where: { id: clusterId },
      include: { entities: { select: { id: true } } },
    });

    if (!cluster) {
      throw new NotFoundException('clusterId não encontrado.');
    }

    const ids = cluster.entities.map((e) => e.id);

    const [, updatedCluster] = await this.prisma.$transaction([
      this.prisma.entity.updateMany({
        where: { id: { in: ids } },
        data: {
          userId,
          name,
        },
      }),
      this.prisma.entityCluster.update({
        where: { id: clusterId },
        data: {
          userId,
          name,
        },
      }),
    ]);

    return updatedCluster;
  }
}
