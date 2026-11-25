import { Tag } from '../models/entities/Tag.js';
import type { Tag as PrismaTag } from '../../generated/prisma/client.js';

export class TagMapper {
  static fromPrisma(prismaTag: PrismaTag & { _count?: { news?: number } }): Tag {
    return new Tag(
      prismaTag.id,
      prismaTag.name,
      prismaTag.slug,
      prismaTag.createdAt,
      prismaTag._count?.news,
    );
  }
}
