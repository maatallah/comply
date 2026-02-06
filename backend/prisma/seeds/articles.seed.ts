import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedArticles() {
    console.log('🌱 Seeding Articles for Regulation REG-001...');

    const regulation = await prisma.regulation.findFirst();

    if (!regulation) {
        console.error('❌ No regulations found. Please run main seeds first.');
        return;
    }

    const articles = [
        {
            regulationId: regulation.id,
            number: 'Art. 1',
            contentFr: 'Le présent texte fixe les conditions générales de sécurité contre les risques d\'incendie.',
            contentAr: 'يضبط هذا النص الشروط العامة للسلامة ضد مخاطر الحريق.'
        },
        {
            regulationId: regulation.id,
            number: 'Art. 5',
            contentFr: 'Les établissements doivent être pourvus de moyens d\'extinction suffisants.',
            contentAr: 'يجب أن تتوفر في المؤسسات وسائل إطفاء كافية.'
        },
        {
            regulationId: regulation.id,
            number: 'Art. 12',
            contentFr: 'Une vérification technique des installations doit être effectuée annuellement.',
            contentAr: 'يجب إجراء فحص فني للمنشآت سنويا.'
        }
    ];

    for (const art of articles) {
        await (prisma as any).article.create({ data: art });
    }

    console.log(`✅ Seeded ${articles.length} articles for ${regulation.code}.`);
}

seedArticles()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
