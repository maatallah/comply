
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    const id = 'f1e2d3c4-b5a6-4078-9012-34567890abcd';

    // Check if exists
    const existing = await prisma.regulation.findUnique({ where: { id } });
    if (existing) {
        console.log('Regulation already exists');
        return;
    }

    // Create custom regulation for Offshore package
    await prisma.regulation.create({
        data: {
            id: id,
            code: 'OFFSHORE-PACK',
            titleFr: 'Régime Totalement Exportateur',
            titleAr: 'نظام التصدير الكلي',
            descriptionFr: 'Dispositions spécifiques pour les entreprises totalement exportatrices (Offshore).',
            descriptionAr: 'أحكام خاصة للشركات المصدرة كلياً.',
            authority: 'Ministère des Finances',
            category: 'FISCAL',
            effectiveDate: new Date('2024-01-01'),
            sourceUrl: null,
        }
    });

    console.log('Created missing regulation');
}

seed()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
