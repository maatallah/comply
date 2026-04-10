import { PrismaClient } from '@prisma/client';
import { seedRegulations } from './regulations';
import { seedControlTemplates } from './controls';
import { seedUsers } from './users';
import { seedProductionData } from './production-data.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting database seeding...\n');

    try {
        // Seed regulations first
        await seedRegulations();
        console.log('');

        // Seed control templates
        await seedControlTemplates();
        console.log('');

        // Seed users
        await seedUsers();
        console.log('');

        // Seed production-ready test data
        await seedProductionData();
        console.log('');

        console.log('🎉 Database seeding completed successfully!');
        console.log('');
        console.log('📊 Summary:');

        const regulationCount = await prisma.regulation.count();
        console.log(`   - Regulations: ${regulationCount}`);

        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Run: npm run db:studio');
        console.log('   2. View regulations in Prisma Studio');
        console.log('   3. Test API: GET http://localhost:3000/regulations');

    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
