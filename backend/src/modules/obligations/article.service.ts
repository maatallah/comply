import prisma from '../../shared/prisma';
import { CreateArticleInput, UpdateArticleInput } from './article.types';

export class ArticleService {

    async createArticle(data: CreateArticleInput) {
        return (prisma as any).article.create({
            data
        });
    }

    async getArticlesByRegulation(regulationId: string) {
        return (prisma as any).article.findMany({
            where: { regulationId },
            orderBy: { number: 'asc' },
            include: {
                obligations: {
                    select: { id: true, titleFr: true }
                }
            }
        });
    }

    async updateArticle(id: string, data: UpdateArticleInput) {
        return (prisma as any).article.update({
            where: { id },
            data
        });
    }

    async deleteArticle(id: string) {
        return (prisma as any).article.delete({
            where: { id }
        });
    }
}

export const articleService = new ArticleService();
