import { PrismaClient, Review } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateReviewDTO {
  clientId: string;
  rating: number;
  comment?: string;
  serviceQuality?: number;
  staffBehavior?: number;
  cleanliness?: number;
}

export class ReviewsService {
  async create(data: CreateReviewDTO): Promise<Review> {
    return await prisma.review.create({
      data,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async list(clientId?: string): Promise<Review[]> {
    return await prisma.review.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStats() {
    const reviews = await prisma.review.findMany();
    const total = reviews.length;
    
    if (total === 0) {
      return {
        total: 0,
        averageRating: 0,
        averageServiceQuality: 0,
        averageStaffBehavior: 0,
        averageCleanliness: 0,
      };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const avgServiceQuality = reviews.filter(r => r.serviceQuality).reduce((sum, r) => sum + (r.serviceQuality || 0), 0) / reviews.filter(r => r.serviceQuality).length || 0;
    const avgStaffBehavior = reviews.filter(r => r.staffBehavior).reduce((sum, r) => sum + (r.staffBehavior || 0), 0) / reviews.filter(r => r.staffBehavior).length || 0;
    const avgCleanliness = reviews.filter(r => r.cleanliness).reduce((sum, r) => sum + (r.cleanliness || 0), 0) / reviews.filter(r => r.cleanliness).length || 0;

    return {
      total,
      averageRating: avgRating,
      averageServiceQuality: avgServiceQuality,
      averageStaffBehavior: avgStaffBehavior,
      averageCleanliness: avgCleanliness,
    };
  }
}
