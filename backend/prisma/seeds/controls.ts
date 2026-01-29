import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== CONTROLS FOR EACH REGULATION ====================
// Controls define WHAT must be done to comply with each regulation

export const controlTemplates = [
    // BSCI Controls
    {
        regulationCode: 'BSCI-2021',
        controls: [
            {
                titleFr: 'Audit BSCI Initial',
                titleAr: 'التدقيق الأولي BSCI',
                controlType: 'CERTIFICATION',
                expectedEvidence: 'Rapport d\'audit BSCI avec score',
                frequency: 'BIENNIAL',
            },
            {
                titleFr: 'Registre des heures de travail',
                titleAr: 'سجل ساعات العمل',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Fichier Excel ou système de pointage',
                frequency: 'CONTINUOUS',
            },
            {
                titleFr: 'Affichage du règlement intérieur',
                titleAr: 'إعلان النظام الداخلي',
                controlType: 'INSPECTION',
                expectedEvidence: 'Photo de l\'affichage',
                frequency: 'ANNUAL',
            },
        ],
    },
    // Fire Safety Controls
    {
        regulationCode: 'DEC-75-503',
        controls: [
            {
                titleFr: 'Visite Protection Civile',
                titleAr: 'زيارة الحماية المدنية',
                controlType: 'CERTIFICATION',
                expectedEvidence: 'PV de visite Protection Civile',
                frequency: 'BIENNIAL',
            },
            {
                titleFr: 'Vérification extincteurs',
                titleAr: 'فحص طفايات الحريق',
                controlType: 'INSPECTION',
                expectedEvidence: 'Étiquettes de vérification + rapport',
                frequency: 'ANNUAL',
            },
            {
                titleFr: 'Exercice d\'évacuation',
                titleAr: 'تمرين الإخلاء',
                controlType: 'TRAINING',
                expectedEvidence: 'PV d\'exercice + liste participants',
                frequency: 'ANNUAL',
            },
            {
                titleFr: 'Plan d\'évacuation affiché',
                titleAr: 'خطة الإخلاء المعلقة',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Photo des plans affichés',
                frequency: 'ANNUAL',
            },
        ],
    },
    // Electrical Safety Controls
    {
        regulationCode: 'DEC-2000-1985',
        controls: [
            {
                titleFr: 'Contrôle technique électrique',
                titleAr: 'الفحص التقني الكهربائي',
                controlType: 'CERTIFICATION',
                expectedEvidence: 'Rapport de contrôle APAVE/Bureau Veritas',
                frequency: 'ANNUAL',
            },
            {
                titleFr: 'Vérification mise à la terre',
                titleAr: 'فحص التأريض',
                controlType: 'INSPECTION',
                expectedEvidence: 'Mesures de résistance de terre',
                frequency: 'ANNUAL',
            },
        ],
    },
    // CNSS Controls
    {
        regulationCode: 'CNSS-LOI-60-30',
        controls: [
            {
                titleFr: 'Déclaration mensuelle CNSS',
                titleAr: 'التصريح الشهري للصندوق',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Bordereau de déclaration + reçu de paiement',
                frequency: 'MONTHLY',
            },
            {
                titleFr: 'Attestation de régularité CNSS',
                titleAr: 'شهادة الوضعية القانونية',
                controlType: 'CERTIFICATION',
                expectedEvidence: 'Attestation CNSS valide',
                frequency: 'QUARTERLY',
            },
        ],
    },
    // TVA Controls
    {
        regulationCode: 'TVA-CGI-2016',
        controls: [
            {
                titleFr: 'Déclaration TVA mensuelle',
                titleAr: 'التصريح الشهري بالأداء',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Déclaration + reçu de paiement',
                frequency: 'MONTHLY',
            },
            {
                titleFr: 'Acompte provisionnel',
                titleAr: 'التسبقة الوقتية',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Bordereau d\'acompte',
                frequency: 'QUARTERLY',
            },
        ],
    },
    // Occupational Health Controls
    {
        regulationCode: 'MT-LOI-94-28',
        controls: [
            {
                titleFr: 'Visite médicale d\'embauche',
                titleAr: 'الفحص الطبي عند التوظيف',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Fiche d\'aptitude médicale',
                frequency: 'CONTINUOUS',
            },
            {
                titleFr: 'Visite médicale annuelle',
                titleAr: 'الفحص الطبي السنوي',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Fiches d\'aptitude pour tous les employés',
                frequency: 'ANNUAL',
            },
            {
                titleFr: 'Contrat médecin du travail',
                titleAr: 'عقد طبيب الشغل',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Contrat signé avec médecin agréé',
                frequency: 'ANNUAL',
            },
        ],
    },
    // Hazardous Waste Controls
    {
        regulationCode: 'ANGED-DEC-2005',
        controls: [
            {
                titleFr: 'Bordereau de suivi des déchets',
                titleAr: 'بوردرو متابعة النفايات',
                controlType: 'DOCUMENT',
                expectedEvidence: 'BSD signés par collecteur agréé',
                frequency: 'CONTINUOUS',
            },
            {
                titleFr: 'Registre des déchets',
                titleAr: 'سجل النفايات',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Registre à jour (types, quantités, dates)',
                frequency: 'MONTHLY',
            },
            {
                titleFr: 'Zone de stockage conforme',
                titleAr: 'منطقة تخزين مطابقة',
                controlType: 'INSPECTION',
                expectedEvidence: 'Photos zone de stockage étiquetée',
                frequency: 'QUARTERLY',
            },
        ],
    },
    // Work Contracts Controls
    {
        regulationCode: 'CT-LOI-66-27',
        controls: [
            {
                titleFr: 'Registre du personnel',
                titleAr: 'سجل العمال',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Registre à jour avec tous les employés',
                frequency: 'CONTINUOUS',
            },
            {
                titleFr: 'Contrats de travail signés',
                titleAr: 'عقود العمل الموقعة',
                controlType: 'DOCUMENT',
                expectedEvidence: 'Contrats pour tous les CDD',
                frequency: 'CONTINUOUS',
            },
            {
                titleFr: 'Affichages obligatoires',
                titleAr: 'الإعلانات الإلزامية',
                controlType: 'INSPECTION',
                expectedEvidence: 'Photos: horaires, RI, convention collective',
                frequency: 'ANNUAL',
            },
        ],
    },
];

// ==================== SEED FUNCTION ====================

export async function seedControlTemplates() {
    console.log('🌱 Seeding Control Templates...');

    for (const template of controlTemplates) {
        // Find the regulation
        const regulation = await prisma.regulation.findUnique({
            where: { code: template.regulationCode },
        });

        if (!regulation) {
            console.log(`  ⚠️  Regulation ${template.regulationCode} not found, skipping controls`);
            continue;
        }

        console.log(`  📋 ${template.regulationCode}:`);

        // We'll store control templates in a JSON field or separate table in future
        // For now, just log what would be created
        for (const ctrl of template.controls) {
            console.log(`     ✅ ${ctrl.titleFr} (${ctrl.frequency})`);
        }
    }

    console.log('✨ Control templates loaded!');
    console.log('ℹ️  Controls will be created when company subscribes to obligations');
}
