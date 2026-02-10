import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedJort() {
    console.log('🌱 Seeding JORT entries...');

    const entries = [
        {
            titleFr: 'Décret-loi n° 2025-3 du 3 octobre 2025, modifiant et complétant la loi n° 2022-15 du 20 mars 2022, relative aux entreprises communautaires.',
            titleAr: 'مرسوم عدد 3 لسنة 2025 مؤرخ في 3 أكتوبر 2025 يتعلق بتنقيح وإتمام القانون عدد 15 لسنة 2022 المؤرخ في 20 مارس 2022 المتعلق بالشركات الأهلية.',
            ministry: 'Présidence de la République',
            type: 'Décret-loi',
            jortNumber: '120',
            date: new Date('2025-10-03'),
            status: 'PENDING',
            pdfUrl: 'http://www.iort.gov.tn/WD120AWP/WD120Awp.exe/CTX_5792-2-ZiJgQiyNIR/AfficheJORT/SYNC_-1853931406'
        },
        {
            titleFr: 'Arrêté du ministre des affaires sociales du 23 septembre 2025, fixant les conditions d\'application du chapitre 30 du code du travail.',
            titleAr: 'قرار من وزير الشؤون الاجتماعية مؤرخ في 23 سبتمبر 2025 يتعلق بضبط شروط تطبيق الباب 30 من مجلة الشغل.',
            ministry: 'Ministère des Affaires Sociales',
            type: 'Arrêté',
            jortNumber: '115',
            date: new Date('2025-09-23'),
            status: 'PENDING',
            pdfUrl: 'http://www.iort.gov.tn/'
        },
        {
            titleFr: 'Loi n° 2025-24 du 23 mai 2025, relative à la modification du code du travail.',
            titleAr: 'قانون عدد 24 لسنة 2025 مؤرخ في 23 ماي 2025 يتعلق بتنقيح مجلة الشغل.',
            ministry: 'Assemblée des représentants du peuple',
            type: 'Loi',
            jortNumber: '62',
            date: new Date('2025-05-23'),
            status: 'RELEVANT',
            processed: true,
            pdfUrl: 'http://www.iort.gov.tn/',
            recordId: '202524'
        }
    ];

    for (const entry of entries) {
        await prisma.jortEntry.create({ data: entry });
    }

    console.log('✅ Seeded 3 JORT entries.');
}

seedJort()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
