
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedUsers() {
    console.log('🌱 Seeding users...');

    // 1. Create Default Company
    const company = await prisma.company.upsert({
        where: { taxId: '0000000/A/A/M/000' },
        update: {},
        create: {
            legalName: 'Société Test S.A.R.L',
            tradeName: 'Test Corp',
            taxId: '0000000/A/A/M/000',
            activitySector: 'TEXTILE',
            companySize: 'MEDIUM',
            email: 'contact@test.tn',
            phone: '+21620000000',
            address: '123 Rue de la République',
            city: 'Tunis',
            country: 'TN',
            regime: 'ONSHORE',
        }
    });

    console.log(`   - Company created/found: ${company.legalName}`);

    // 2. Create Admin User
    const email = 'admin@test.tn';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            role: 'COMPANY_ADMIN',
            isActive: true,
            companyId: company.id,
        },
        create: {
            email,
            passwordHash,
            firstName: 'Admin',
            lastName: 'System',
            role: 'COMPANY_ADMIN',
            companyId: company.id,
            isActive: true,
            preferredLanguage: 'fr'
        }
    });

    console.log(`   - User created/found: ${user.email} (Password: ${password})`);
}
