
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function verifyLogin() {
    try {
        console.log('🔍 Finding user...');
        const user = await prisma.user.findUnique({
            where: { email: 'cpt.systeme@gnet.tn' }
        });

        if (!user) {
            console.log('❌ User NOT found.');
            return;
        }

        console.log('✅ User found:', user.email);

        console.log('🔑 verifying password "password123"...');
        const match = await bcrypt.compare('password123', user.passwordHash);

        if (match) {
            console.log('✅ Password MATCHES!');
        } else {
            console.log('❌ Password DOES NOT MATCH!');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLogin();
