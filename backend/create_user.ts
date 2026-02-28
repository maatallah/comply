
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        let company = await prisma.company.findFirst();
        if (!company) {
            console.log('Creating default company...');
            company = await prisma.company.create({
                data: {
                    legalName: 'GlobalNet',
                    tradeName: 'GNET',
                    taxId: '00000000',
                    activitySector: 'TECHNOLOGY',
                    companySize: 'MEDIUM',
                    country: 'TN',
                    regime: 'ONSHORE'
                }
            });
        }

        const user = await prisma.user.create({
            data: {
                email: 'cpt.systeme@gnet.tn',
                passwordHash: hashedPassword,
                firstName: 'Cpt',
                lastName: 'Systeme',
                role: 'COMPANY_ADMIN',
                companyId: company.id
            }
        });

        console.log('✅ User created:', user.email);
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.log('User already exists, updating password...');
            const userHelper = await prisma.user.findUnique({ where: { email: 'cpt.systeme@gnet.tn' } });
            if (userHelper) {
                const updated = await prisma.user.update({
                    where: { id: userHelper.id },
                    data: { passwordHash: hashedPassword }
                });
                console.log('✅ User password updated:', updated.email);
            }
        } else {
            console.error('Error creating user:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
