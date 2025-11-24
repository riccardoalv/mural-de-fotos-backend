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

    return this.prisma.$transaction(async (tx) => {
      const cluster = await tx.entityCluster.findUnique({
        where: { id: clusterId },
        include: { entities: { select: { id: true } } },
      });

      if (!cluster) {
        throw new NotFoundException('clusterId não encontrado.');
      }

      const existingCluster = await tx.entityCluster.findFirst({
        where: {
          userId,
          id: { not: clusterId },
        },
        include: { entities: { select: { id: true } } },
      });

      if (existingCluster) {
        const otherEntityIds = existingCluster.entities.map((e) => e.id);

        if (otherEntityIds.length > 0) {
          await tx.entity.updateMany({
            where: { id: { in: otherEntityIds } },
            data: {
              clusterId,
              userId,
              name,
            },
          });
        }

        await tx.entityCluster.delete({
          where: { id: existingCluster.id },
        });
      }

      const currentEntityIds = cluster.entities.map((e) => e.id);

      if (currentEntityIds.length > 0) {
        await tx.entity.updateMany({
          where: { id: { in: currentEntityIds } },
          data: {
            userId,
            name,
          },
        });
      }

      const updatedCluster = await tx.entityCluster.update({
        where: { id: clusterId },
        data: {
          userId,
          name,
        },
      });

      return updatedCluster;
    });
  }

  async addEntityOnCluster(entityId: string, clusterId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new NotFoundException('entity not found');
    }

    return await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        clusterId: clusterId,
      },
    });
  }

  async removeEntityFromCluster(entityId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new NotFoundException('entity not found');
    }

    return await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        clusterId: null,
      },
    });
  }
}
